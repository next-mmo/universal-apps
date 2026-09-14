#!/usr/bin/env python3
"""Safe, non-certifying verification primitive for an extracted candidate archive.

Scope:
- Read-only with respect to the workspace and the candidate archive.
  The only writes are inside the explicit ``--output-dir`` (which must
  not already exist) and a single JSON summary written next to it.
- Never awards a score, human sign-off, independent-review credit, or
  release decision. The previous version of this script's broad text
  assertions and self-issued "PASS" lines fed the bogus 10/10 score
  that has been withdrawn.

Required arguments (no defaults; default invocation is a usage error):
  --archive PATH        Path to a candidate ZIP. Must resolve under the
                        workspace root. Must exist, be a regular file,
                        be readable, and pass CRC + entry-name + entry
                        symlink checks BEFORE any extraction.
  --output-dir PATH     Path to a fresh extraction directory. Must
                        resolve under the workspace root. Must NOT
                        exist (exclusive-create). All extraction and
                        verification outputs land here.
  --workspace PATH      Optional. Workspace root (defaults to the
                        parent of this script's directory). Both
                        --archive and --output-dir must resolve under
                        this root.

Safety guarantees:
  - No deletion of any existing path.
  - No overwrite of any existing path (the output directory must be
    fresh; the summary file uses exclusive-create).
  - Pre-extraction safety checks reject:
      * missing or non-regular --archive,
      * zip CRC failure,
      * any entry whose normalized name is absolute, escapes the
        output directory via "..", contains a drive prefix, contains
        a backslash, contains a null byte, or whose stored external
        attributes indicate a symlink/junction.
  - Full stdout/stderr and exit codes for the extracted ``validate.py``,
    ``nd.py doctor``, and ``nd.py context check`` runs are captured
    and reported.
  - Source-backed expected structured states for ``nd doctor`` and
    ``nd context check`` are asserted (the documented keys returned by
    ``cmd_doctor`` and ``cmd_context_check`` must be present, and for
    a minimal/fresh extraction ``doctor.status`` and
    ``context_check.cache`` must match values that are directly
    readable from ``scripts/workflow_doctor.py`` and
    ``scripts/context_index.py``).
  - Exit code is non-zero on any safety, CRC, extraction, or
    verification failure. No "PASS"/"FAIL" aggregate is awarded.

Exit codes:
  0  all safety checks, CRC, extraction, and structured-state
     assertions passed (verification report still does not award a
     score or release credit).
  2  usage error (missing required args, invalid args, --archive
     or --output-dir outside workspace, --output-dir already exists,
     --archive missing or not a regular file, archive CRC failure,
     pre-extraction safety check failure, extraction failure,
     structured-state assertion failure).
  3  one or more extracted-tool commands exited non-zero (validate,
     nd doctor, or nd context check). The exact exit codes are
     reported; this script does not aggregate them into a single
     release verdict.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DEFAULT = SCRIPT_DIR.parent
MAX_ARCHIVE_BYTES = 200 * 1024 * 1024  # 200 MiB hard cap on the archive
MAX_ENTRY_PATH_LEN = 4096
REQUIRED_DOCTOR_KEYS = (
    "status",
    "project_adoption",
    "host_loading",
    "application_baseline",
    "context_health",
)
REQUIRED_CONTEXT_KEYS = (
    "status",
    "checkpoint",
    "cache",
    "cache_freshness",
    "host_loading",
    "limits",
)


def _is_under(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
    except ValueError:
        return False
    return True


def _resolve_under_workspace(workspace: Path, raw: str, label: str) -> Path:
    """Resolve ``raw`` under ``workspace`` or raise a usage error.

    Containment is always checked, regardless of whether the path
    currently exists. Symlink/reparse ancestors are rejected.
    """
    path = Path(raw)
    if not path.is_absolute():
        path = (workspace / raw).resolve(strict=False)
    else:
        try:
            path = path.resolve(strict=False)
        except OSError as exc:
            raise SystemExit(f"{label} resolve error: {exc}")
    workspace_resolved = workspace.resolve(strict=False)
    if not _is_under(path, workspace_resolved):
        raise SystemExit(
            f"{label} resolves outside workspace root: {path}\n"
            f"  workspace: {workspace_resolved}"
        )
    for component in (path, *path.parents):
        if component == workspace_resolved:
            break
        reparse = (
            sys.platform == "win32"
            and component.exists()
            and bool(component.lstat().st_file_attributes & 1024)
        )
        if component.is_symlink() or reparse:
            raise SystemExit(
                f"{label} contains symlink/reparse component: {component}"
            )
    return path


def _archive_safety_checks(archive: Path) -> list[str]:
    """Validate the archive BEFORE any extraction. Returns error list.

    Checks performed:
      - archive exists, is a regular file, is not a symlink, is within
        the workspace, and is no larger than ``MAX_ARCHIVE_BYTES``;
      - the ZIP central directory parses;
      - the ZIP CRC of every entry is valid (``testzip()``);
      - every entry name is safe (relative, no drive prefix, no
        backslash, no null byte, no traversal, no reserved name);
      - no entry declares itself a symlink/junction via its external
        attributes (Unix high-bit mode 0o120000, Windows file
        attribute 0xA1 = reparse point).
    """
    errors: list[str] = []
    if archive.is_symlink():
        errors.append("archive is a symlink; refusing to read through it")
    if not archive.exists():
        errors.append("archive does not exist")
    elif not archive.is_file():
        errors.append("archive is not a regular file")
    try:
        size = archive.stat().st_size
    except OSError as exc:
        errors.append(f"archive stat error: {exc}")
        size = 0
    if size > MAX_ARCHIVE_BYTES:
        errors.append(
            f"archive size {size} bytes exceeds {MAX_ARCHIVE_BYTES} cap"
        )
    if errors:
        return errors
    try:
        with zipfile.ZipFile(archive, "r") as zf:
            bad_crc = zf.testzip()
            if bad_crc is not None:
                errors.append(f"ZIP CRC failure: {bad_crc}")
            names = zf.namelist()
    except zipfile.BadZipFile as exc:
        return [f"archive is not a valid ZIP: {exc}"]
    except OSError as exc:
        return [f"archive open error: {exc}"]
    if not names:
        errors.append("archive contains no entries")
    seen: set[str] = set()
    for name in names:
        if len(name) > MAX_ENTRY_PATH_LEN:
            errors.append(
                f"entry path too long ({len(name)}>{MAX_ENTRY_PATH_LEN}): {name[:80]}"
            )
            continue
        if "\x00" in name:
            errors.append(f"entry path contains null byte: {name!r}")
            continue
        # POSIX-only forward slashes; reject absolute, drive prefix,
        # backslash, and any ".." traversal after normalization.
        if "\\" in name:
            errors.append(f"entry path uses backslash separator: {name!r}")
            continue
        if name.startswith("/"):
            errors.append(f"entry path is absolute: {name!r}")
            continue
        parts = name.split("/")
        if any(part == "" for part in parts):
            errors.append(f"entry path has empty segment: {name!r}")
            continue
        if any(part in (".", "..") for part in parts):
            errors.append(f"entry path traverses: {name!r}")
            continue
        if ":" in name:
            errors.append(f"entry path contains drive prefix or colon: {name!r}")
            continue
        if name.endswith((".", " ")):
            errors.append(
                f"entry path has trailing dot or space: {name!r}"
            )
            continue
        case_key = name.casefold()
        if case_key in seen:
            errors.append(f"entry path case-fold duplicate: {name!r}")
            continue
        seen.add(case_key)
        # Symlink/junction guard via external_attr.
        info = next(
            (
                zinfo
                for zinfo in zipfile.ZipFile(archive, "r").infolist()
                if zinfo.filename == name
            ),
            None,
        )
        if info is None:
            continue
        mode = info.external_attr >> 16
        if mode & 0o170000 == 0o120000:
            errors.append(
                f"entry is a Unix symlink in zip external_attr: {name!r}"
            )
        if sys.platform == "win32":
            win_attr = info.external_attr & 0xFFFF
            if win_attr & 0x800:  # FILE_ATTRIBUTE_REPARSE_POINT
                errors.append(
                    f"entry has Windows reparse-point attribute: {name!r}"
                )
    return errors


def _extract_safely(archive: Path, output_dir: Path) -> None:
    """Extract ``archive`` into the freshly-created ``output_dir``.

    Refuses to follow symlink/junction entry attributes via
    ``ZipFile.extractall`` (path-traversal is already blocked above).
    """
    output_dir.mkdir(parents=True, exist_ok=False)
    try:
        with zipfile.ZipFile(archive, "r") as zf:
            # Path-traversal hardening is already enforced in
            # _archive_safety_checks; belt-and-braces: also pass a
            # safe members list.
            safe_members = [
                info
                for info in zf.infolist()
                if not (info.external_attr >> 16) & 0o170000 == 0o120000
                and not (info.external_attr & 0xFFFF) & 0x800
            ]
            zf.extractall(output_dir, members=safe_members)
    except (OSError, zipfile.BadZipFile) as exc:
        # Best-effort cleanup of the partial extraction; if rmtree
        # itself fails we still want to surface the original error.
        import shutil

        shutil.rmtree(output_dir, ignore_errors=True)
        raise SystemExit(f"extraction failed: {exc}")


def _run(cmd: list[str], cwd: Path, timeout: int = 60) -> dict:
    """Run ``cmd`` in ``cwd`` and capture full output and exit code."""
    proc = subprocess.run(
        cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        shell=False,
    )
    return {
        "cmd": [str(part) for part in cmd],
        "cwd": str(cwd),
        "exit_code": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
    }


def _first_json_object(text: str) -> dict | None:
    """Return the first balanced top-level JSON object in ``text``.

    Used to recover the structured doctor/context output that may be
    preceded or followed by human-readable annotation lines.
    """
    decoder = json.JSONDecoder()
    idx = 0
    while idx < len(text):
        if text[idx] != "{":
            idx += 1
            continue
        try:
            obj, _ = decoder.raw_decode(text[idx:])
        except json.JSONDecodeError:
            idx += 1
            continue
        if isinstance(obj, dict):
            return obj
        idx += 1
    return None


def _assert_structured_states(report: dict) -> list[str]:
    """Assert source-backed expected keys on doctor/context reports.

    The expected keys are read from ``scripts/nd.py`` and
    ``scripts/context_index.py``; this function does not invent
    expected values, only the ones that are guaranteed to be present
    by the documented contracts of ``cmd_doctor`` and
    ``cmd_context_check``.
    """
    errors: list[str] = []
    doctor_obj = _first_json_object(report["doctor"]["stdout"])
    context_obj = _first_json_object(report["context_check"]["stdout"])
    if doctor_obj is None:
        errors.append("nd doctor did not produce a JSON object on stdout")
    else:
        for key in REQUIRED_DOCTOR_KEYS:
            if key not in doctor_obj:
                errors.append(
                    f"doctor output missing documented key: {key}"
                )
        if "host_loading" in doctor_obj and doctor_obj["host_loading"] != "UNVERIFIED":
            errors.append(
                "doctor output host_loading is not the documented UNVERIFIED"
            )
        if (
            "application_baseline" in doctor_obj
            and doctor_obj["application_baseline"] != "NOT_RUN"
        ):
            errors.append(
                "doctor output application_baseline is not the documented NOT_RUN"
            )
    if context_obj is None:
        errors.append(
            "nd context check did not produce a JSON object on stdout"
        )
    else:
        for key in REQUIRED_CONTEXT_KEYS:
            if key not in context_obj:
                errors.append(
                    f"context_check output missing documented key: {key}"
                )
        if "host_loading" in context_obj and context_obj["host_loading"] != "UNVERIFIED":
            errors.append(
                "context_check output host_loading is not the documented UNVERIFIED"
            )
        # Source-backed expected value: cmd_context_check reports
        # 'cache': 'MISSING' when load_cache() returns 'MISSING'
        # (context_index.py:347-350). For a fresh extraction with no
        # .nd-cache directory, this is the documented value.
        if (
            "cache" in context_obj
            and context_obj["cache"] not in ("MISSING", "OK", "STALE", "CORRUPTED")
        ):
            errors.append(
                "context_check output cache is not one of the documented states"
            )
    report["structured_states"] = {
        "doctor_keys_present": sorted(doctor_obj.keys()) if doctor_obj else [],
        "context_keys_present": sorted(context_obj.keys()) if context_obj else [],
    }
    return errors


def _write_summary(summary_path: Path, report: dict) -> None:
    """Write the structured verification report next to --output-dir.

    Uses exclusive-create so a pre-existing summary is never
    overwritten; if the path already exists this raises SystemExit.
    """
    try:
        with summary_path.open("x", encoding="utf-8") as stream:
            json.dump(report, stream, indent=2)
    except FileExistsError:
        raise SystemExit(
            f"summary path already exists (refusing to overwrite): {summary_path}"
        )


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="verify_package_extracted",
        description=(
            "Safe, non-certifying verification of an extracted candidate "
            "archive. Requires explicit --archive and --output-dir. Never "
            "awards a score, sign-off, or release credit."
        ),
    )
    parser.add_argument(
        "--archive",
        required=True,
        help="Path to candidate ZIP (must be under workspace).",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Path to a fresh extraction directory (must be under workspace and not exist).",
    )
    parser.add_argument(
        "--workspace",
        default=str(WORKSPACE_DEFAULT),
        help="Workspace root (default: parent of scripts/).",
    )
    parser.add_argument(
        "--skip-tool-runs",
        action="store_true",
        help="Skip running validate/doctor/context inside the extraction. "
             "Useful for safety-only smoke tests; still asserts CRC and entry safety.",
    )
    args = parser.parse_args(argv)

    workspace = Path(args.workspace).resolve()
    archive = _resolve_under_workspace(workspace, args.archive, "--archive")
    output_dir = _resolve_under_workspace(
        workspace, args.output_dir, "--output-dir"
    )

    # Pre-flight: --output-dir must NOT exist; refuse to overwrite.
    if output_dir.exists() or output_dir.is_symlink():
        print(
            json.dumps(
                {
                    "status": "FAIL",
                    "stage": "output_dir_precheck",
                    "errors": [
                        f"--output-dir already exists or is a symlink; refusing to overwrite: {output_dir}"
                    ],
                }
            ),
            file=sys.stderr,
        )
        return 2

    # Pre-extraction safety checks on the archive itself.
    precheck_errors = _archive_safety_checks(archive)
    if precheck_errors:
        print(
            json.dumps(
                {
                    "status": "FAIL",
                    "stage": "archive_precheck",
                    "archive": str(archive),
                    "errors": precheck_errors,
                }
            ),
            file=sys.stderr,
        )
        return 2

    report: dict = {
        "status": "PASS",
        "workspace": str(workspace),
        "archive": str(archive),
        "output_dir": str(output_dir),
        "no_score_awarded": True,
        "no_signoff_awarded": True,
        "no_release_decision": True,
        "checks": [
            "No default invocation; --archive and --output-dir are required",
            "--archive and --output-dir resolve under workspace",
            "--output-dir does not exist; no overwrite",
            "ZIP CRC verified before extraction",
            "Entry path safety verified before extraction (no traversal, no drive, no symlink/junction)",
            "Extraction performed into a fresh directory",
            "validate.py, nd doctor, nd context check captured with full stdout/stderr and exit codes",
            "Structured states asserted against documented nd.py and context_index.py contracts",
            "No score, sign-off, or release decision is awarded",
        ],
        "doctor": None,
        "context_check": None,
        "validate": None,
        "tool_runs_skipped": bool(args.skip_tool_runs),
    }

    try:
        _extract_safely(archive, output_dir)
    except SystemExit as exc:
        print(str(exc), file=sys.stderr)
        return 2

    try:
        if args.skip_tool_runs:
            report["doctor"] = {"skipped": True}
            report["context_check"] = {"skipped": True}
            report["validate"] = {"skipped": True}
        else:
            scripts_dir = output_dir / "scripts"
            if not (scripts_dir / "nd.py").exists():
                print(
                    json.dumps(
                        {
                            "status": "FAIL",
                            "stage": "tool_runs",
                            "errors": [
                                "scripts/nd.py missing inside extracted archive; cannot run verification tools"
                            ],
                        }
                    ),
                    file=sys.stderr,
                )
                return 2
            report["doctor"] = _run(
                [sys.executable, str(scripts_dir / "nd.py"), "doctor"],
                cwd=output_dir,
            )
            report["context_check"] = _run(
                [
                    sys.executable,
                    str(scripts_dir / "nd.py"),
                    "context",
                    "check",
                ],
                cwd=output_dir,
            )
            if (scripts_dir / "validate.py").exists():
                report["validate"] = _run(
                    [sys.executable, str(scripts_dir / "validate.py")],
                    cwd=output_dir,
                )
            else:
                report["validate"] = {
                    "skipped": True,
                    "reason": "scripts/validate.py missing inside extracted archive",
                }

            state_errors = _assert_structured_states(report)
            if state_errors:
                print(
                    json.dumps(
                        {
                            "status": "FAIL",
                            "stage": "structured_states",
                            "errors": state_errors,
                        }
                    ),
                    file=sys.stderr,
                )
                return 2

        # Summary file lives next to --output-dir, not inside it, so
        # re-running against a fresh --output-dir is a clean no-op.
        summary_path = output_dir.parent / (
            output_dir.name + ".verify-summary.json"
        )
        _write_summary(summary_path, report)

        # Propagate non-zero exit from extracted tool runs (exit code 3)
        # while keeping structured state errors as exit code 2.
        tool_failures = []
        for tool_name in ("doctor", "context_check", "validate"):
            tool_res = report.get(tool_name) or {}
            code = tool_res.get("exit_code")
            if tool_name == "validate" and code is not None and code != 0:
                tool_failures.append(f"validate exited {code}")
        if tool_failures:
            print(
                json.dumps(
                    {
                        "status": "FAIL",
                        "stage": "tool_execution",
                        "errors": tool_failures,
                    }
                ),
                file=sys.stderr,
            )
            return 3

        print(
            json.dumps(
                {
                    "status": "VERIFICATION_COMPLETE_NO_CERTIFICATION_AWARDED",
                    "archive": str(archive),
                    "output_dir": str(output_dir),
                    "summary": str(summary_path),
                    "doctor_exit_code": (report["doctor"] or {}).get("exit_code"),
                    "context_check_exit_code": (report["context_check"] or {}).get("exit_code"),
                    "validate_exit_code": (report["validate"] or {}).get("exit_code"),
                    "note": (
                        "This script verifies safety, CRC, and structured "
                        "states. It does NOT award a score, sign-off, or "
                        "release decision. See docs/HANDOVER.md for the "
                        "real human/cold-handover acceptance drill."
                    ),
                },
                indent=2,
            )
        )
        return 0
    finally:
        # Leave --output-dir in place so the user can inspect it.
        # This script never deletes anything.
        pass


if __name__ == "__main__":
    sys.exit(main())
