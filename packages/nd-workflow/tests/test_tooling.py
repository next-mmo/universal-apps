#!/usr/bin/env python3
"""Tests for scripts/validate.py and scripts/package.py.

All ephemeral state lives under ``.validation/tooling-tests/`` (this
file's parent repo). No home or system temp directories are touched.

Each test allocates a UUID-suffixed fixture directory and refuses to
delete an existing directory; if the generated name is taken, a new
name is tried. The fixture is a snapshot of the current live repo at
run time, so the suite stays green while the parent session is
editing docs. Tests fail loudly (not skip) if a required fixture file
is missing in the live repo.

Regression coverage is added for the issues raised in the parent code
review (see comments per test).
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import unittest
import uuid
import zipfile
from pathlib import Path
from unittest import mock

# --- Paths --------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
TEST_ROOT = REPO_ROOT / ".validation" / "tooling-tests"
MANIFEST_NAME = "package-files.json"

# All files required to build a valid fixture. RUNBOOK.md and
# HANDOVER.md are required (per parent review).
FIXTURE_REQUIRED = [
    ".gitattributes",
    ".gitignore",
    "AGENTS.md",
    "BENHMARK.md",
    "CLAUDE.md",
    "LICENSE",
    "README.md",
    "START-HERE.md",
    "package-files.json",
    ".agents/docs/ARCHITECTURE.md",
    ".agents/docs/PROJECT.md",
    ".agents/docs/WORKFLOW.md",
    ".agents/skills/nd-bump-version/SKILL.md",
    ".agents/skills/nd-compound/SKILL.md",
    ".agents/skills/nd-converge-check/SKILL.md",
    ".agents/skills/nd-doc-lookup/SKILL.md",
    ".agents/skills/nd-spec-feature/SKILL.md",
    ".agents/skills/nd-task-status/SKILL.md",
    ".agents/skills/nd-setup-project/SKILL.md",
    ".agents/skills/nd-setup-project/references/superpowers.md",
    ".agents/skills/nd-workflow-doctor/SKILL.md",
    ".agents/skills/nd-skill-creator/SKILL.md",
    ".agents/skills/nd-skill-editor/SKILL.md",
    ".agents/skills/nd-feedback-collector/SKILL.md",
    ".agents/skills/nd-user-testing/SKILL.md",
    ".agents/templates/PLAN.md",
    ".agents/templates/PRD.md",
    ".agents/templates/RUNBOOK.md",
    ".agents/templates/TASK.md",
    "docs/HANDOVER.md",
    "docs/ONBOARDING.md",
    "docs/README.md",
    "docs/plans/README.md",
    "docs/prd/README.md",
    "docs/tasks/README.md",
    "docs/tasks/done/.gitkeep",
    "scripts/package.py",
    "scripts/validate.py",
    "tests/test_tooling.py",
]

FIVE_SKILLS = (
    "doc-lookup",
    "spec-feature",
    "converge-check",
    "compound",
    "bump-version",
)

HARD_REQUIRED_NAMES = (
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


# --- Helpers ------------------------------------------------------------

def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def _copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def _build_fixture(root: Path) -> list[str]:
    """Copy every FIXTURE_REQUIRED file from the live repo into root.

    Returns the list of files actually copied. Raises FileNotFoundError
    if any required file is missing in the live repo (so the test
    fails loudly, not silently skips).
    """
    sys.path.insert(0, str(SCRIPTS_DIR))
    from validate import load_manifest, read_source_file, validate_repo
    manifest, errors = load_manifest(REPO_ROOT)
    if errors:
        raise ValueError(errors)
    report = validate_repo(REPO_ROOT)
    if report["status"] != "PASS":
        raise ValueError(report["errors"])
    paths = manifest['files']
    missing = [rel for rel in FIXTURE_REQUIRED if rel not in paths]
    if missing:
        raise FileNotFoundError(
            "Required fixture files missing in live repo: " + ", ".join(missing)
        )
    # npm transports store .gitignore under an explicit physical alias. Build
    # ordinary canonical fixtures instead of assuming the authoring layout.
    for rel in paths:
        destination = root / rel
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(read_source_file(REPO_ROOT, rel, manifest))
    return list(paths)


def _write_manifest(root: Path, files: list[str]) -> None:
    manifest = {"version": 1, "description": "Test fixture manifest", "files": files}
    (root / MANIFEST_NAME).write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline="\n"
    )


def _run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd, cwd=str(cwd) if cwd else None, capture_output=True, text=True
    )


# --- Base fixture test case --------------------------------------------

class FixtureTestCase(unittest.TestCase):
    """Each test gets an isolated, UUID-suffixed fixture under TEST_ROOT."""

    @classmethod
    def setUpClass(cls) -> None:
        TEST_ROOT.mkdir(parents=True, exist_ok=True)

    def _allocate_fixture_dir(self) -> Path:
        """Allocate a unique, non-existent fixture dir under TEST_ROOT.

        Does not delete any existing directory. If a name is already
        taken, a new UUID is tried (up to 10 attempts).
        """
        for _ in range(10):
            uid = uuid.uuid4().hex[:8]
            path = TEST_ROOT / f"{self._testMethodName}__{uid}"
            try:
                path.mkdir(parents=True, exist_ok=False)
                return path
            except FileExistsError:
                continue
        raise RuntimeError(
            f"Could not allocate a unique fixture dir for {self._testMethodName}"
        )

    def setUp(self) -> None:
        self.fixture = self._allocate_fixture_dir()
        self.copied = _build_fixture(self.fixture)
        _write_manifest(self.fixture, list(self.copied))

    def tearDown(self) -> None:
        # Only remove the dir we created; never touch unrelated paths.
        if self.fixture.exists():
            shutil.rmtree(self.fixture)

    def run_validate(self) -> subprocess.CompletedProcess:
        return _run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "validate.py"),
                "--root",
                str(self.fixture),
            ]
        )

    def run_package(self, output: Path) -> subprocess.CompletedProcess:
        return _run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "package.py"),
                "--root",
                str(self.fixture),
                "--output",
                str(output),
            ]
        )


# --- Positive baseline --------------------------------------------------

class TestValidatePositive(FixtureTestCase):
    def test_fixture_writer_preserves_utf8_lf_bytes(self) -> None:
        path = self.fixture / "unicode-fixture.md"
        _write_text(path, "# Tiếng Việt\n第二行\n")
        self.assertEqual(path.read_bytes(), "# Tiếng Việt\n第二行\n".encode("utf-8"))

    def test_line_ending_policy_is_distributed(self) -> None:
        self.assertIn(".gitattributes", self.copied)
        self.assertIn(b"* text=auto eol=lf", (self.fixture / ".gitattributes").read_bytes())

    def test_line_ending_policy_is_independently_required(self) -> None:
        _write_manifest(self.fixture, [p for p in self.copied if p != ".gitattributes"])
        result = self.run_validate()
        self.assertEqual(result.returncode, 1)
        self.assertIn(".gitattributes", result.stdout)

    def test_clean_fixture_passes(self) -> None:
        result = self.run_validate()
        self.assertEqual(
            result.returncode, 0,
            f"validate failed:\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}",
        )
        self.assertIn("Status: PASS", result.stdout)

    def test_validate_does_not_write(self) -> None:
        before = {p.relative_to(self.fixture).as_posix() for p in self.fixture.rglob("*")}
        result = self.run_validate()
        after = {p.relative_to(self.fixture).as_posix() for p in self.fixture.rglob("*")}
        self.assertEqual(result.returncode, 0)
        self.assertEqual(before, after, "validate.py must not write any files")

    def test_agents_word_count_reported(self) -> None:
        # The report must include the AGENTS.md word count.
        result = self.run_validate()
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("agents_word_count", result.stdout)
        # Parent reports AGENTS.md = 392 words. Live count must be present.
        import re as _re
        m = _re.search(r"agents_word_count.*?words=(\d+)", result.stdout)
        self.assertIsNotNone(m, "AGENTS.md word count missing from report")
        words = int(m.group(1))
        self.assertGreater(words, 0)
        self.assertLessEqual(words, 450, f"AGENTS.md {words} words exceeds 450 budget")


# --- Negative validation: missing required files ------------------------

class TestValidateMissingFile(FixtureTestCase):
    def test_required_hard_file_absent_from_manifest_and_disk(self) -> None:
        target = "AGENTS.md"  # hard-required
        (self.fixture / target).unlink()
        self.copied = [f for f in self.copied if f != target]
        _write_manifest(self.fixture, self.copied)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("AGENTS.md", combined)
        self.assertIn("required", combined.lower())

    def test_required_skill_absent_from_manifest(self) -> None:
        self.copied = [f for f in self.copied if "spec-feature" not in f]
        _write_manifest(self.fixture, self.copied)
        result = self.run_validate()
        self.assertNotNotEqual = None  # no-op marker
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("spec-feature", combined)


# --- Negative validation: broken link -----------------------------------

class TestValidateBrokenLink(FixtureTestCase):
    def test_markdown_with_broken_relative_link(self) -> None:
        path = self.fixture / "AGENTS.md"
        original = _read_text(path)
        injected = original + "\n[broken](definitely-missing-target-12345.md)\n"
        _write_text(path, injected)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("missing link target", combined)
        self.assertIn("definitely-missing-target-12345.md", combined)


# --- Negative validation: invalid frontmatter ---------------------------

class TestValidateInvalidFrontmatter(FixtureTestCase):
    def test_missing_frontmatter_block(self) -> None:
        path = self.fixture / ".agents/skills/nd-doc-lookup/SKILL.md"
        _write_text(path, "# nd-doc-lookup without frontmatter\n\nbody\n")
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("frontmatter", combined.lower())
        self.assertIn("nd-doc-lookup", combined)


# --- Negative validation: unsafe manifest paths ------------------------
# Regression coverage for parent review items 2 and 3.

class TestValidateUnsafeManifest(FixtureTestCase):
    def test_traversal_path_rejected(self) -> None:
        bad = self.copied + ["../escape.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("traversal", (result.stdout + result.stderr).lower())

    def test_dot_segment_rejected(self) -> None:
        bad = self.copied + ["./escape.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("dot segment", (result.stdout + result.stderr).lower())

    def test_double_slash_empty_segment_rejected(self) -> None:
        bad = self.copied + ["foo//bar.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("empty path segment", (result.stdout + result.stderr).lower())

    def test_absolute_unix_path_rejected(self) -> None:
        bad = self.copied + ["/etc/passwd"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("absolute", (result.stdout + result.stderr).lower())

    def test_drive_letter_prefix_rejected(self) -> None:
        # 'C:foo' is a drive-relative path on Windows.
        bad = self.copied + ["C:foo.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("drive prefix", (result.stdout + result.stderr).lower())

    def test_drive_letter_with_slash_rejected(self) -> None:
        bad = self.copied + ["C:/foo.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("drive prefix", (result.stdout + result.stderr).lower())

    def test_colon_in_path_rejected(self) -> None:
        # Anything containing a colon is rejected (ADS / drive prefix).
        bad = self.copied + ["foo:bar.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("colon", (result.stdout + result.stderr).lower())

    def test_backslash_path_rejected(self) -> None:
        bad = self.copied + ["dir\\file.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("backslash", (result.stdout + result.stderr).lower())

    def test_trailing_dot_segment_rejected(self) -> None:
        bad = self.copied + ["foo./bar.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("trailing dot", (result.stdout + result.stderr).lower())

    def test_trailing_space_segment_rejected(self) -> None:
        bad = self.copied + ["foo /bar.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("trailing", (result.stdout + result.stderr).lower())

    def test_reserved_device_name_rejected(self) -> None:
        for name in ("CON", "PRN", "AUX", "NUL", "COM1", "LPT1"):
            with self.subTest(name=name):
                bad = self.copied + [f"{name}.md"]
                _write_manifest(self.fixture, bad)
                result = self.run_validate()
                self.assertNotEqual(
                    result.returncode, 0, f"reserved name {name} was accepted"
                )
                self.assertIn(
                    "reserved", (result.stdout + result.stderr).lower()
                )

    def test_secret_path_rejected(self) -> None:
        secret = self.fixture / "private.key"
        _write_text(secret, "FAKE\n")
        bad = self.copied + ["private.key"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("secret", (result.stdout + result.stderr).lower())

    def test_symlink_rejected(self) -> None:
        link = self.fixture / "linked.md"
        try:
            link.symlink_to(self.fixture / "AGENTS.md")
        except (OSError, NotImplementedError):
            self.skipTest("symlink creation not supported on this platform")
        bad = self.copied + ["linked.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("symlink", (result.stdout + result.stderr).lower())

    def test_symlink_ancestor_escape_rejected(self) -> None:
        # Create a symlink directory under the fixture whose target is
        # outside the fixture root; add a file path that traverses it.
        outside = TEST_ROOT / "outside_anchor"
        outside.mkdir(parents=True, exist_ok=True)
        anchor_file = outside / "anchor.md"
        _write_text(anchor_file, "# anchor\n")
        linkdir = self.fixture / "linkdir"
        try:
            linkdir.symlink_to(outside, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("symlink creation not supported on this platform")
        bad = self.copied + ["linkdir/anchor.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        combined = result.stdout + result.stderr
        # Either 'resolves outside' or 'symlink ancestor' must fire
        self.assertNotEqual(result.returncode, 0, combined)
        self.assertTrue(
            "resolves outside" in combined or "symlink ancestor" in combined,
            combined,
        )

    def test_directory_entry_rejected(self) -> None:
        # Adding a directory to the manifest must fail (regular file required).
        newdir = self.fixture / "scripts" / "subdir"
        newdir.mkdir(parents=True, exist_ok=True)
        bad = self.copied + ["scripts/subdir"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("regular file", (result.stdout + result.stderr).lower())

    def test_duplicate_path_rejected(self) -> None:
        bad = self.copied + ["AGENTS.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("duplicate", (result.stdout + result.stderr).lower())

    def test_case_fold_duplicate_rejected(self) -> None:
        # 'AGENTS.md' vs 'agents.md' are duplicates on case-insensitive
        # filesystems and must be rejected.
        # Create a second file with a different-cased name.
        lower = self.fixture / "agents.md"
        _write_text(lower, "# agents\n")
        bad = list(self.copied) + ["agents.md"]
        _write_manifest(self.fixture, bad)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("case-fold", (result.stdout + result.stderr).lower())


# --- Negative validation: corrupted source -----------------------------

class TestValidateCorruptedSource(FixtureTestCase):
    def test_utf8_bom_rejected(self) -> None:
        path = self.fixture / "AGENTS.md"
        raw = path.read_bytes()
        path.write_bytes(b"\xef\xbb\xbf" + raw)
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("BOM", result.stdout + result.stderr)

    def test_cr_line_endings_rejected(self) -> None:
        path = self.fixture / "AGENTS.md"
        text = _read_text(path)
        path.write_bytes(text.replace("\n", "\r\n").encode("utf-8"))
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("CR", result.stdout + result.stderr)

    def test_agents_word_budget_exceeded_rejected(self) -> None:
        # Create a bloated AGENTS.md to exceed the 450-word budget.
        path = self.fixture / "AGENTS.md"
        # 500 words => exceeds the 450 limit
        _write_text(path, "word " * 500 + "\n")
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("450", combined)
        self.assertIn("AGENTS.md", combined)


# --- Manifest loading: malformed manifest ------------------------------

class TestValidateMalformedManifest(FixtureTestCase):
    def test_invalid_utf8_manifest_fails_before_content_reads(self) -> None:
        # Write the manifest with non-UTF-8 bytes.
        manifest_path = self.fixture / MANIFEST_NAME
        manifest_path.write_bytes(b'\x80\x81{"files": []}\n')
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("manifest", combined.lower())

    def test_non_dict_manifest_rejected(self) -> None:
        manifest_path = self.fixture / MANIFEST_NAME
        manifest_path.write_text('"just a string"\n', encoding="utf-8")
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("object", (result.stdout + result.stderr).lower())

    def test_missing_files_list_rejected(self) -> None:
        manifest_path = self.fixture / MANIFEST_NAME
        manifest_path.write_text('{"version": 1}\n', encoding="utf-8")
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("'files'", (result.stdout + result.stderr))


# --- Packaging ----------------------------------------------------------

class TestPackage(FixtureTestCase):
    def test_package_succeeds_and_zip_is_well_formed(self) -> None:
        output = self.fixture / "out.zip"
        result = self.run_package(output)
        self.assertEqual(
            result.returncode, 0,
            f"package failed:\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}",
        )
        self.assertTrue(output.exists(), "output ZIP not created")
        with zipfile.ZipFile(output) as zf:
            self.assertIsNone(zf.testzip(), "ZIP CRC failure")
            names = set(zf.namelist())
            for rel in self.copied:
                self.assertIn(rel, names, f"missing entry in ZIP: {rel}")
            for name in zf.namelist():
                with zf.open(name) as fh:
                    self.assertEqual(
                        fh.read(),
                        (self.fixture / name).read_bytes(),
                        f"byte mismatch for {name}",
                    )

    def test_existing_output_is_preserved(self) -> None:
        # Pre-create the destination. Package must NOT delete or
        # overwrite it; must exit non-zero.
        output = self.fixture / "out.zip"
        original = "PRE-EXISTING CONTENT DO NOT OVERWRITE"
        _write_text(output, original)
        result = self.run_package(output)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(_read_text(output), original, "output was modified!")

    def test_package_validates_before_create(self) -> None:
        # Break validation by removing a file referenced in the manifest.
        (self.fixture / "AGENTS.md").unlink()
        output = self.fixture / "out.zip"
        result = self.run_package(output)
        self.assertNotEqual(result.returncode, 0)
        # The output ZIP must NOT be created when validation fails.
        self.assertFalse(
            output.exists(),
            "package.py must not create the ZIP when validation fails",
        )

    def test_package_reports_required_fields(self) -> None:
        output = self.fixture / "out.zip"
        result = self.run_package(output)
        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["status"], "PASS")
        for key in ("artifact", "entries", "size_bytes", "sha256", "file_sha256"):
            self.assertIn(key, data, f"missing key: {key}")
        self.assertEqual(data["entries"], len(self.copied))
        self.assertEqual(len(data["file_sha256"]), len(self.copied))


# --- Packaging: output path safety (parent review item 9) --------------

class TestPackageOutputPath(FixtureTestCase):
    def test_output_under_repo_root(self) -> None:
        # An output that resolves outside the repo root must be rejected.
        outside = TEST_ROOT / f"escape_{uuid.uuid4().hex[:6]}.zip"
        result = self.run_package(outside)
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("outside", combined.lower())
        self.assertFalse(outside.exists())

    def test_output_collides_with_source_file(self) -> None:
        # Output that collides with a manifest source file is rejected.
        # Use a copy of AGENTS.md (write to a path inside the fixture
        # that is also a manifest entry).
        result = self.run_package(self.fixture / "AGENTS.md")
        self.assertNotEqual(result.returncode, 0)
        combined = result.stdout + result.stderr
        self.assertIn("collides", combined.lower())
        # Original AGENTS.md is preserved
        self.assertTrue((self.fixture / "AGENTS.md").is_file())

    def test_output_is_existing_symlink_preserved(self) -> None:
        # An existing symlink that points outside the repo is rejected
        # and the symlink itself is preserved (we never delete).
        outside = TEST_ROOT / f"symlink_target_{uuid.uuid4().hex[:6]}.bin"
        _write_text(outside, "target-bytes")
        link = self.fixture / f"link_{uuid.uuid4().hex[:6]}.zip"
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest("symlink creation not supported on this platform")
        # Make the link a non-existent path: package.py should still
        # detect the symlink and reject.
        result = self.run_package(link)
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(link.is_symlink(), "symlink was deleted!")

    def test_output_parent_dir_created_safely_after_validation(self) -> None:
        # A non-existent parent dir under the fixture is created
        # automatically (after validation passes).
        newdir = self.fixture / "artifacts_subdir"
        output = newdir / "out.zip"
        self.assertFalse(newdir.exists())
        result = self.run_package(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(output.exists())

    def test_exclusive_create_race_preserves_existing(self) -> None:
        # Simulate a race: file appears between precheck and open.
        # We can only realistically test that 'x' mode is configured
        # correctly by checking that the open raises FileExistsError
        # and the file is preserved. We do this by pre-creating the
        # file (the same observable outcome).
        output = self.fixture / "out.zip"
        original = b"racing-writer-content"
        output.write_bytes(original)
        result = self.run_package(output)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(output.read_bytes(), original, "file was overwritten by race!")


# --- Extraction (subset smoke only; full suite is the parent's job) ---

class TestPackageExtractionSubset(FixtureTestCase):
    """Smoke test that an extracted archive can run a non-recursive
    subset of tests. The full test suite is runnable from the extracted
    directory but is NOT exercised here, to avoid recursive self-
    execution; the parent should run the full suite for end-to-end
    confirmation.
    """

    def test_extracted_package_validates(self) -> None:
        output = self.fixture / "out.zip"
        result = self.run_package(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        extract = self.fixture / "extracted"
        extract.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output) as zf:
            zf.extractall(extract)
        self.assertFalse((extract / ".validation").exists(),
                         "extracted archive must not contain .validation")
        self.assertFalse((extract / "artifacts").exists(),
                         "extracted archive must not contain artifacts")
        v = _run(
            [
                sys.executable,
                str(extract / "scripts" / "validate.py"),
                "--root",
                str(extract),
            ]
        )
        self.assertEqual(v.returncode, 0, v.stdout + v.stderr)

    def test_extracted_package_runs_safe_subset(self) -> None:
        output = self.fixture / "out.zip"
        result = self.run_package(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        extract = self.fixture / "extracted"
        extract.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output) as zf:
            zf.extractall(extract)
        # A non-recursive subset (no packaging, no extraction) proves
        # the extracted dir is functional. The full suite is the
        # parent's responsibility.
        t = _run(
            [
                sys.executable,
                "-m",
                "unittest",
                "tests.test_tooling.TestFrontmatterParser",
                "-v",
            ],
            cwd=str(extract),
        )
        self.assertEqual(t.returncode, 0, t.stdout + t.stderr)


# --- Direct frontmatter parser tests (regression suite) ----------------

class TestFrontmatterParser(unittest.TestCase):
    """Direct unit tests of the strict-scalar frontmatter parser."""

    def _parse(self, text: str) -> tuple[dict, list[str]]:
        sys.path.insert(0, str(SCRIPTS_DIR))
        from validate import parse_skill_frontmatter  # noqa: WPS433
        return parse_skill_frontmatter(text)

    def test_valid_unquoted_with_punctuation(self) -> None:
        text = (
            "---\n"
            "name: doc-lookup\n"
            "description: Fast docs. Use when looking for things.\n"
            "---\n"
            "# body\n"
        )
        fm, errors = self._parse(text)
        self.assertEqual(errors, [], msg=f"unexpected errors: {errors}")
        self.assertEqual(fm["name"], "doc-lookup")
        self.assertEqual(fm["description"], "Fast docs. Use when looking for things.")

    def test_value_with_internal_double_quotes(self) -> None:
        text = (
            "---\n"
            "name: spec-feature\n"
            'description: Feature spec. Use when asked to "spec a new feature".\n'
            "---\n"
        )
        fm, errors = self._parse(text)
        self.assertEqual(errors, [], msg=f"unexpected errors: {errors}")
        self.assertIn('"spec a new feature"', fm["description"])

    def test_missing_closing_delimiter(self) -> None:
        text = "---\nname: foo\n"
        _, errors = self._parse(text)
        self.assertTrue(any("closing" in e for e in errors), msg=str(errors))

    def test_no_frontmatter_at_all(self) -> None:
        _, errors = self._parse("just a body, no frontmatter\n")
        self.assertTrue(any("---" in e for e in errors), msg=str(errors))

    def test_duplicate_key(self) -> None:
        text = "---\nname: foo\nname: bar\ndescription: x\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("duplicate" in e for e in errors), msg=str(errors))

    def test_empty_value(self) -> None:
        text = "---\nname:\ndescription: x\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("empty value" in e for e in errors), msg=str(errors))

    def test_bracket_container_rejected(self) -> None:
        text = "---\nname: [a, b]\ndescription: x\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("container" in e for e in errors), msg=str(errors))

    def test_brace_container_rejected(self) -> None:
        text = "---\nname: {a: b}\ndescription: x\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("container" in e for e in errors), msg=str(errors))

    def test_quoted_value_rejected(self) -> None:
        text = '---\nname: "foo"\ndescription: x\n---\n'
        _, errors = self._parse(text)
        self.assertTrue(any("quoted" in e for e in errors), msg=str(errors))

    def test_unterminated_quote_rejected(self) -> None:
        # Unterminated quote: starts with " but does not end with one.
        text = '---\nname: "foo\ndescription: bar\n---\n'
        _, errors = self._parse(text)
        self.assertTrue(any("quoted" in e for e in errors), msg=str(errors))

    def test_list_marker_rejected(self) -> None:
        text = "---\nname: foo\n- description: x\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("list marker" in e for e in errors), msg=str(errors))

    def test_unsupported_key_rejected(self) -> None:
        text = "---\nname: foo\nversion: 1\ndescription: bar\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("unsupported key" in e for e in errors), msg=str(errors))

    def test_block_scalar_pipe_rejected(self) -> None:
        text = "---\nname: foo\ndescription: |\n  text\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("block scalar" in e for e in errors), msg=str(errors))

    def test_block_scalar_gt_rejected(self) -> None:
        text = "---\nname: foo\ndescription: >\n  text\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("block scalar" in e for e in errors), msg=str(errors))

    def test_tag_rejected(self) -> None:
        text = "---\nname: foo\ndescription: !str bar\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("tag" in e for e in errors), msg=str(errors))

    def test_alias_rejected(self) -> None:
        text = "---\nname: foo\ndescription: *anchor\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("tag" in e or "alias" in e for e in errors), msg=str(errors))

    def test_missing_required_key_name_reported(self) -> None:
        text = "---\ndescription: only description\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(any("missing required 'name'" in e for e in errors), msg=str(errors))

    def test_missing_required_key_description_reported(self) -> None:
        text = "---\nname: only-name\n---\n"
        _, errors = self._parse(text)
        self.assertTrue(
            any("missing required 'description'" in e for e in errors), msg=str(errors)
        )


class TestParentRegressions(unittest.TestCase):
    def test_gitignore_is_independently_required(self):
        sys.path.insert(0, str(SCRIPTS_DIR))
        from validate import check_hard_required
        errors = check_hard_required([p for p in FIXTURE_REQUIRED if p != '.gitignore'])
        self.assertTrue(any('.gitignore' in e for e in errors))

    def test_windows_device_extension_and_wildcard_rejected(self):
        sys.path.insert(0, str(SCRIPTS_DIR))
        from validate import is_safe_relative_path
        for path in ('NUL.txt', 'docs/CON.md', 'file?.md', 'file*.md'):
            with self.subTest(path=path):
                self.assertFalse(is_safe_relative_path(path)[0])

    def test_output_symlink_not_resolved_away(self):
        from unittest.mock import patch
        sys.path.insert(0, str(SCRIPTS_DIR))
        import package
        output = REPO_ROOT / '.validation' / 'not-created-symlink.zip'
        original = Path.is_symlink
        def pretend_link(path):
            return path == output or original(path)
        with patch.object(Path, 'is_symlink', pretend_link):
            errors = package._check_output_path(REPO_ROOT, output, FIXTURE_REQUIRED)
        self.assertTrue(any('symlink' in e for e in errors))

class TestDistributionLinks(FixtureTestCase):
    def test_linked_existing_file_must_be_packaged(self):
        _write_text(self.fixture / 'docs' / 'local-only.md', '# Not shipped\n')
        path = self.fixture / 'docs' / 'README.md'
        _write_text(path, _read_text(path) + '\n[Local only](local-only.md)\n')
        result = self.run_validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('omitted from distribution manifest', result.stdout)

class TestSpecificationApprovalContract(unittest.TestCase):
    """Static instruction regressions, not proof of model/host compliance."""

    def text(self, relative):
        return (REPO_ROOT / relative).read_text(encoding="utf-8")

    def test_spec_only_persists_draft_and_stops(self):
        text = self.text(".agents/skills/nd-spec-feature/SKILL.md")
        for required in ("specification-only", "Save the draft PRD", "Stop after presenting",
                         "Questionnaire answers", "not scope approval"):
            self.assertIn(required, text)

    def test_approval_provenance_and_execution_are_separate(self):
        text = self.text(".agents/templates/PRD.md")
        for required in ("## Approval record", "Approver", "revision or content hash",
                         "Approval evidence", "Execution authorization", "not authorized"):
            self.assertIn(required, text)

    def test_drafting_checkpoint_is_not_an_implementation_task(self):
        text = self.text(".agents/templates/TASK.md")
        for required in ("specification-only", "Execution authorization",
                         "drafting checkpoint", "session checklist is not a substitute"):
            self.assertIn(required, text)

    def test_workflow_preserves_direct_fixes_and_reapproval(self):
        text = self.text(".agents/docs/WORKFLOW.md")
        for required in ("## Specification and execution authorization",
                         "Direct implementation requests", "explicit approval and start",
                         "Material scope changes", "not implementation permission"):
            self.assertIn(required, text)

    def test_resume_checks_authorization(self):
        text = self.text("docs/HANDOVER.md")
        self.assertIn("approval evidence", text)
        self.assertIn("execution authorization", text)
        self.assertIn("awaiting approval", text)


class TestStageLinkBoundary(unittest.TestCase):
    """``reject_links`` must stop at the platform's top level.

    Regression: walking ancestors to the filesystem root rejected
    OS-owned aliases such as macOS ``/var -> /private/var``. Every
    temporary-directory target failed on the macOS CI cells even though
    no caller-controlled link was involved.
    """

    def setUp(self) -> None:
        sys.path.insert(0, str(SCRIPTS_DIR))
        import stage_project

        self.stage_project = stage_project

    @staticmethod
    def _paths():
        root = Path(Path.cwd().anchor)
        alias = root / "platform-alias"
        project = alias / "workspace" / "project"
        return alias, project

    def test_top_level_platform_alias_tolerated(self) -> None:
        alias, project = self._paths()
        with mock.patch.object(self.stage_project, "linked", lambda p: p == alias):
            # macOS /var-style alias: no caller-controlled link, no error.
            self.stage_project.reject_links(project)

    def test_top_level_path_itself_still_rejected(self) -> None:
        alias, _ = self._paths()
        with mock.patch.object(self.stage_project, "linked", lambda p: p == alias):
            # The path a caller asks about is always inspected, even when
            # it sits directly under the filesystem root.
            with self.assertRaises(ValueError):
                self.stage_project.reject_links(alias)

    def test_link_below_top_level_still_rejected(self) -> None:
        _, project = self._paths()
        for linked_path in (project, project.parent):
            with mock.patch.object(
                self.stage_project, "linked", lambda p, c=linked_path: p == c
            ):
                with self.assertRaises(ValueError, msg=str(linked_path)):
                    self.stage_project.reject_links(project)

# --- Entry point --------------------------------------------------------

if __name__ == "__main__":
    TEST_ROOT.mkdir(parents=True, exist_ok=True)
    if os.environ.get("TOOLING_TEST_INCEPTION"):
        # Opt-in non-recursive subset for safe nested runs.
        loader = unittest.TestLoader()
        suite = loader.loadTestsFromTestCase(TestFrontmatterParser)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        sys.exit(0 if result.wasSuccessful() else 1)
    unittest.main()
