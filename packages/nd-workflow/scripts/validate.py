#!/usr/bin/env python3
"""Validate the workflow-starter distribution manifest and source files.

Read-only CLI: never writes to the repository or fixture. Reports findings
to stdout; exits 0 on PASS, 1 on FAIL. Detects manifest path-safety
(includes Windows drive/colon/reserved-name/empty-segment/trailing
dot-or-space rules and case-fold duplicate detection), required-file
presence, hard-required entries, AGENTS.md word budget, source-path
containment under root with no link-ancestor escape, regular-file
requirement, UTF-8/LF discipline, basic fenced-block balance,
relative-link resolution, and STRICT subset of skill frontmatter
(name + description as single-line unquoted scalars; no other keys;
no block/tag/alias/quote-start values; reject unterminated quotes).

The parser does NOT claim general Markdown or YAML support. Link and
fence checks are heuristic.

Bail-before-unsafe-reads: if manifest loading or manifest path safety
fails, content checks are skipped.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

MANIFEST_FILENAME = "package-files.json"
REQUIRED_SKILLS = (
    "nd-doc-lookup",
    "nd-spec-feature",
    "nd-converge-check",
    "nd-compound",
    "nd-bump-version",
    "nd-setup-project",
    "nd-workflow-doctor",
    "nd-task-status",
    "nd-skill-creator",
    "nd-skill-editor",
    "nd-feedback-collector",
    "nd-user-testing",
)
# Hard-required manifest entries (independent of whatever else the
# manifest lists). bootstrap = START-HERE.md (not .gitkeep).
HARD_REQUIRED_FILES = (
    ".gitattributes",
    ".gitignore",
    "docs/HANDOVER.md",
    ".agents/templates/RUNBOOK.md",
    "AGENTS.md",
    "CLAUDE.md",
    "LICENSE",
    "README.md",
    "START-HERE.md",
    "package-files.json",
    "scripts/validate.py",
    "scripts/package.py",
    "tests/test_tooling.py",
)
SECRET_HINTS = (
    ".env", "secret", "credentials", "private.key", "id_rsa", ".pem",
    "id_ed25519", ".key", "credentials.json",
)
RESERVED_WINDOWS_NAMES = frozenset(
    name.casefold()
    for name in (
        "CON", "PRN", "AUX", "NUL",
        "COM1", "COM2", "COM3", "COM4", "COM5",
        "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5",
        "LPT6", "LPT7", "LPT8", "LPT9",
    )
)
ALLOWED_FRONT_KEYS = frozenset({"name", "description"})
MAX_SKILL_BYTES = 100_000
AGENTS_WORD_BUDGET = 450
MAX_ERRORS_IN_REPORT = 30


# --- Path safety ---------------------------------------------------------

def is_safe_relative_path(p: str) -> tuple[bool, str]:
    """Reject empty, drive-prefix, colon, traversal, dot, empty segment,
    trailing dot/space, reserved-name, or control-char paths."""
    if not p:
        return False, "empty path"
    if any(ord(c) < 0x20 or ord(c) == 0x7F for c in p):
        return False, "control character in path"
    if "\\" in p:
        return False, "backslash not allowed; use POSIX forward slashes"
    if p.startswith("/"):
        return False, "absolute path not allowed"
    # Windows drive prefix: 'C:', 'C:/', 'C:\\', 'C:foo' (drive-relative)
    if len(p) >= 2 and p[1] == ":" and (p[0].isalpha()):
        return False, "Windows drive prefix not allowed"
    if ":" in p:
        return False, "colon not allowed (drive prefix or ADS)"
    parts = p.split("/")
    for part in parts:
        if not part:
            return False, "empty path segment not allowed"
        if part in (".", ".."):
            return False, "path traversal or dot segment not allowed"
        if part.endswith(".") or part.endswith(" "):
            return False, "trailing dot or space in segment not allowed"
        if any(c in part for c in '<>"|?*'):
            return False, "Windows-invalid character in path"
        if part.split('.')[0].casefold() in RESERVED_WINDOWS_NAMES:
            return False, f"reserved Windows device name not allowed: {part}"
    return True, ""


def looks_like_secret(p: str) -> bool:
    lower = p.lower()
    for hint in SECRET_HINTS:
        if hint in lower:
            return True
    return False


# --- Frontmatter parser (STRICT scalar subset) ---------------------------

def parse_skill_frontmatter(text: str) -> tuple[dict, list[str]]:
    """Parse ONLY single-line unquoted ``name`` and ``description`` scalars.

    Rejects:
    - Missing/empty frontmatter or missing closing delimiter
    - Indented or list-marker lines
    - Quoted values (any quote-start, even unterminated)
    - Container values starting with ``[`` or ``{``
    - Block scalars (``|`` / ``>``) and tag/alias (``!`` / ``*`` / ``&``)
    - Keys outside the {name, description} set
    - Duplicate keys, empty keys, empty values
    """
    errors: list[str] = []
    if not text.startswith("---\n"):
        return {}, ["frontmatter must start with '---' on line 1"]
    body_start = 4
    closing = re.search(r"\n---\n", text[body_start:])
    if not closing:
        return {}, ["frontmatter closing '---' not found"]
    body = text[body_start:body_start + closing.start()]
    result: dict[str, str] = {}
    seen: set[str] = set()
    for lineno, line in enumerate(body.splitlines(), 1):
        if not line.strip():
            continue
        if line.startswith((" ", "\t")):
            errors.append(
                f"frontmatter line {lineno}: indented/list lines not supported"
            )
            continue
        if line.startswith(("- ", "-")):
            errors.append(
                f"frontmatter line {lineno}: list marker not supported"
            )
            continue
        if ":" not in line:
            errors.append(f"frontmatter line {lineno}: missing ':' separator")
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if not key:
            errors.append(f"frontmatter line {lineno}: empty key")
            continue
        if key not in ALLOWED_FRONT_KEYS:
            errors.append(
                f"frontmatter line {lineno}: unsupported key '{key}'"
                f" (only {sorted(ALLOWED_FRONT_KEYS)} allowed)"
            )
            continue
        if key in seen:
            errors.append(f"frontmatter line {lineno}: duplicate key '{key}'")
            continue
        if not value:
            errors.append(f"frontmatter line {lineno}: empty value for '{key}'")
            continue
        # Reject any value that starts with a quote (even unterminated).
        if value.startswith(('"', "'")):
            errors.append(
                f"frontmatter line {lineno}: quoted value not supported for '{key}'"
            )
            continue
        # Reject container values
        if value.startswith(("[", "{")) or value.endswith(("]", "}")):
            errors.append(
                f"frontmatter line {lineno}: container value not supported for '{key}'"
            )
            continue
        # Reject block scalar markers
        if value.startswith(("|", ">")):
            errors.append(
                f"frontmatter line {lineno}: block scalar not supported for '{key}'"
            )
            continue
        # Reject tag and alias markers
        if value.startswith(("!", "*", "&")):
            errors.append(
                f"frontmatter line {lineno}: tag/alias not supported for '{key}'"
            )
            continue
        seen.add(key)
        result[key] = value
    # Required-key presence checks: the supported subset is {name,
    # description}; the parser reports missing required keys so that
    # the check is self-contained and easy to unit-test.
    for required in ("name", "description"):
        if required not in result:
            errors.append(f"frontmatter missing required '{required}'")
    return result, errors


# --- Manifest loading and safety checks ---------------------------------

def load_manifest(root: Path) -> tuple[dict, list[str]]:
    """Load and structurally validate the manifest. Returns (data, errors).

    Catches missing file, OSError, UnicodeDecodeError, JSONDecodeError,
    and structural type errors. Caller must bail if errors are returned
    before doing any other (potentially unsafe) reads.
    """
    manifest_path = root / MANIFEST_FILENAME
    is_reparse = (sys.platform == 'win32' and manifest_path.exists()
                  and bool(manifest_path.lstat().st_file_attributes & 1024))
    if manifest_path.is_symlink() or is_reparse:
        return {}, ['manifest must not be a symlink or reparse point']
    if not manifest_path.exists():
        return {}, [f"manifest not found: {MANIFEST_FILENAME}"]
    try:
        text = manifest_path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        return {}, [f"manifest UTF-8 decode error: {exc}"]
    except OSError as exc:
        return {}, [f"manifest read error: {exc}"]
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        return {}, [f"manifest JSON parse error: {exc}"]
    if not isinstance(data, dict):
        return {}, ["manifest root must be a JSON object"]
    files = data.get("files")
    if not isinstance(files, list):
        return {}, ["manifest must contain a 'files' list"]
    return data, []


def _is_under(child: Path, parent: Path) -> bool:
    """True if child resolves to a path under parent."""
    try:
        child.relative_to(parent)
    except ValueError:
        return False
    return True


def validate_manifest_paths(root: Path, files: list) -> list[str]:
    """Validate each manifest path is a safe, regular file under root.

    - Rejects unsafe strings (see ``is_safe_relative_path``).
    - Rejects duplicate entries on a case-folded basis.
    - Rejects secret-suspect basenames.
    - Resolves symlinks; rejects entries whose resolved path escapes
      the repo root, or whose path passes through any symlink that
      escapes root.
    - Requires the entry to be a regular file (not a directory, not
      a symlink, not a special file).
    """
    errors: list[str] = []
    seen: set[str] = set()
    root_resolved = root.resolve(strict=False)
    for raw in files:
        if not isinstance(raw, str):
            errors.append(f"manifest entry not a string: {raw!r}")
            continue
        ok, reason = is_safe_relative_path(raw)
        if not ok:
            errors.append(f"manifest path {raw!r}: {reason}")
            continue
        case_key = raw.casefold()
        if case_key in seen:
            errors.append(
                f"manifest path {raw!r}: case-fold duplicate entry"
            )
            continue
        seen.add(case_key)
        if looks_like_secret(raw):
            errors.append(f"manifest path {raw!r}: looks like a secret path")
            continue
        # Containment: resolve and ensure the entry stays under root.
        # A symlink ancestor that escapes root will surface here.
        src = root / raw
        try:
            resolved = src.resolve(strict=False)
        except OSError as exc:
            errors.append(f"manifest path {raw!r}: resolve error: {exc}")
            continue
        if not _is_under(resolved, root_resolved):
            errors.append(
                f"manifest path {raw!r}: resolves outside repo root"
            )
            continue
        # Reject if the entry itself is a symlink, or any ancestor in
        # the manifest-relative path is a symlink whose target is
        # outside the root.
        current = root
        for part in raw.split("/"):
            current = current / part
            is_reparse = (sys.platform == 'win32' and current.exists()
                          and bool(current.lstat().st_file_attributes & 1024))
            if current.is_symlink() or is_reparse:
                errors.append(f"manifest path {raw!r}: symlink/reparse ancestor '{part}' rejected")
                break
        else:
            # No link-ancestor escape. Now require a regular file.
            if not resolved.is_file():
                errors.append(
                    f"manifest path {raw!r}: not a regular file"
                )
                continue
    return errors


# --- Hard-required entries ----------------------------------------------

def check_hard_required(files: list) -> list[str]:
    errors: list[str] = []
    file_set = set(files)
    for required in HARD_REQUIRED_FILES:
        if required not in file_set:
            errors.append(f"required file missing from manifest: {required}")
    for skill in REQUIRED_SKILLS:
        skill_path = f".agents/skills/{skill}/SKILL.md"
        if skill_path not in file_set:
            errors.append(f"required skill missing from manifest: {skill_path}")
    return errors


# --- AGENTS.md word budget ---------------------------------------------

def count_words(text: str) -> int:
    return len([w for w in text.split() if w])


def check_agents_word_budget(root: Path) -> tuple[list[str], int]:
    """Return (errors, count). Empty errors list on PASS."""
    path = root / "AGENTS.md"
    if not path.exists():
        return ["AGENTS.md missing for word-budget check"], 0
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return [f"AGENTS.md read error: {exc}"], 0
    count = count_words(text)
    if count > AGENTS_WORD_BUDGET:
        return [
            f"AGENTS.md word count {count} exceeds budget of {AGENTS_WORD_BUDGET}"
        ], count
    return [], count


# --- UTF-8 / LF / fence / link heuristics --------------------------------

def check_utf8_and_links(root: Path, files: list) -> tuple[list[str], dict]:
    errors: list[str] = []
    counts = {"files": 0, "relative_links": 0, "fences": 0}
    root_resolved = root.resolve()
    for rel in files:
        path = root / rel
        if not path.exists():
            continue
        if path.suffix.lower() not in (".md", ".markdown"):
            continue
        counts["files"] += 1
        try:
            raw = path.read_bytes()
        except OSError as exc:
            errors.append(f"{rel}: read error: {exc}")
            continue
        if raw.startswith(b"\xef\xbb\xbf"):
            errors.append(f"{rel}: UTF-8 BOM not allowed")
        if b"\r" in raw:
            errors.append(f"{rel}: CR line endings not allowed; use LF")
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            errors.append(f"{rel}: UTF-8 decode error: {exc}")
            continue
        if not text.endswith("\n"):
            errors.append(f"{rel}: missing final newline")
        in_fence = False
        for n, line in enumerate(text.splitlines(), 1):
            if line.rstrip() != line:
                errors.append(f"{rel}:{n}: trailing whitespace")
            if line.startswith("```"):
                counts["fences"] += 1
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", line):
                if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
                    continue
                target_clean = target.split("#", 1)[0]
                if not target_clean:
                    continue
                counts["relative_links"] += 1
                link_path = (path.parent / target_clean).resolve()
                if not _is_under(link_path, root_resolved):
                    errors.append(f"{rel}:{n}: link escapes repo: {target}")
                    continue
                if not link_path.exists():
                    errors.append(f"{rel}:{n}: missing link target: {target}")
                elif link_path.is_file() and link_path.relative_to(root_resolved).as_posix() not in files:
                    errors.append(f"{rel}:{n}: linked file omitted from distribution manifest: {target}")
        if in_fence:
            errors.append(f"{rel}: unclosed code fence")
    return errors, counts


# --- Skill frontmatter checks -------------------------------------------

def check_skill_frontmatter(root: Path, files: list) -> list[str]:
    errors: list[str] = []
    for rel in files:
        if not rel.endswith("/SKILL.md"):
            continue
        path = root / rel
        if not path.exists():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError as exc:
            errors.append(f"{rel}: read error: {exc}")
            continue
        if len(text.encode("utf-8")) >= MAX_SKILL_BYTES:
            errors.append(f"{rel}: exceeds {MAX_SKILL_BYTES}-byte limit")
        fm, fm_errors = parse_skill_frontmatter(text)
        errors.extend(f"{rel}: {msg}" for msg in fm_errors)
        if "name" not in fm:
            errors.append(f"{rel}: frontmatter missing required 'name'")
        if "description" not in fm:
            errors.append(f"{rel}: frontmatter missing required 'description'")
        if "name" in fm and fm["name"] not in REQUIRED_SKILLS:
            errors.append(
                f"{rel}: frontmatter name '{fm['name']}' not in known skills"
            )
    return errors


# --- Top-level validate --------------------------------------------------

def validate_repo(root: Path) -> dict:
    report: dict = {
        "root": str(root),
        "manifest": str(root / MANIFEST_FILENAME),
        "status": "PASS",
        "errors": [],
        "checks": {},
    }
    data, load_errors = load_manifest(root)
    report["errors"].extend(load_errors)
    if load_errors:
        report["status"] = "FAIL"
        return report
    files = data["files"]
    path_errors = validate_manifest_paths(root, files)
    hard_errors = check_hard_required(files)
    # Bail before content reads if manifest entries are unsafe.
    if path_errors:
        report["errors"].extend(path_errors)
        report["errors"].extend(hard_errors)
        report["checks"]["manifest_paths"] = {"errors": len(path_errors)}
        report["checks"]["hard_required"] = {"errors": len(hard_errors)}
        report["file_count"] = len(files)
        report["status"] = "FAIL"
        return report

    agents_errors, agents_words = check_agents_word_budget(root)
    link_errors, link_counts = check_utf8_and_links(root, files)
    fm_errors = check_skill_frontmatter(root, files)
    report["checks"]["manifest_paths"] = {"errors": len(path_errors)}
    report["checks"]["hard_required"] = {"errors": len(hard_errors)}
    report["checks"]["agents_word_count"] = {
        "errors": len(agents_errors),
        "words": agents_words,
        "budget": AGENTS_WORD_BUDGET,
    }
    report["checks"]["utf8_links"] = {"errors": len(link_errors), **link_counts}
    report["checks"]["skill_frontmatter"] = {"errors": len(fm_errors)}
    report["errors"].extend(hard_errors)
    report["errors"].extend(agents_errors)
    report["errors"].extend(link_errors)
    report["errors"].extend(fm_errors)
    report["file_count"] = len(files)
    report["status"] = "PASS" if not report["errors"] else "FAIL"
    return report


# --- Reporting (stdout human-readable; the AGENTS.md count is in the
# --- structured report, not part of the stdout word budget) ------------

def format_report(report: dict) -> str:
    lines: list[str] = [
        f"Status: {report['status']}",
        f"Root: {report['root']}",
        f"Manifest: {report['manifest']}",
        f"Files in manifest: {report.get('file_count', 0)}",
        "",
        "Checks:",
    ]
    for name, info in report.get("checks", {}).items():
        suffix = ""
        if name == "utf8_links":
            suffix = (
                f"  (files={info.get('files', 0)}"
                f" relative_links={info.get('relative_links', 0)}"
                f" fences={info.get('fences', 0)})"
            )
        elif name == "agents_word_count":
            suffix = (
                f"  (words={info.get('words', 0)}"
                f" budget={info.get('budget', AGENTS_WORD_BUDGET)})"
            )
        lines.append(f"  {name}: {info.get('errors', 0)} errors{suffix}")
    lines.append("")
    errors = report["errors"]
    if errors:
        lines.append(f"Errors ({len(errors)}):")
        for msg in errors[:MAX_ERRORS_IN_REPORT]:
            lines.append(f"  - {msg}")
        if len(errors) > MAX_ERRORS_IN_REPORT:
            lines.append(
                f"  ... and {len(errors) - MAX_ERRORS_IN_REPORT} more"
            )
    else:
        lines.append("No errors.")
    lines.append("")
    lines.append(
        "Limitations: link and fence checks are heuristic; not a full"
        " Markdown or YAML parser. Frontmatter parser is a strict"
        " scalar subset (name + description, single-line unquoted)."
    )
    return "\n".join(lines)


# --- CLI -----------------------------------------------------------------

def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate the workflow-starter distribution (read-only)."
    )
    parser.add_argument(
        "--root",
        default=None,
        help="Repo root (default: parent of scripts/)",
    )
    args = parser.parse_args(argv)
    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parent.parent
    report = validate_repo(root)
    text = format_report(report)
    print(text)
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
