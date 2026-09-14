"""Regression tests for the readiness-helper scripts.

The previous version of the readiness-helper scripts deleted fixtures,
overwrote authoritative candidate evidence, awarded a bogus 10/10
release score, and self-certified independent human/maintainer
review. This module locks in the safe behaviour:

- Four legacy entry points (``run_independent_review``,
  ``run_onboarding_drill``, ``rebuild_candidate_zip``,
  ``record_candidate_evidence``) are deprecated: any invocation exits
  non-zero and produces no file writes, deletions, or score output.

- ``scripts/verify_package_extracted.py`` is a safe verification
  primitive: it refuses to run without explicit ``--archive`` and
  ``--output-dir``, refuses to overwrite an existing output directory,
  validates the archive CRC and entry safety before extracting, never
  deletes any path, and asserts source-backed structured states for
  ``nd doctor`` and ``nd context check`` without awarding a score,
  sign-off, or release credit.

These tests do NOT touch the existing
``artifacts/workflow-starter-candidate-001.zip`` or any file under
``docs/evidence/readiness/candidate-001/``. All fixtures are
synthesised into ``ROOT / '.validation'`` (a disposable scratch
directory already used by other test modules) and a temporary
working directory.
"""
from __future__ import annotations

import contextlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
SCRATCH = ROOT / ".validation"

DEPRECATED_SCRIPTS = (
    "run_independent_review.py",
    "run_onboarding_drill.py",
    "rebuild_candidate_zip.py",
    "record_candidate_evidence.py",
)


def _python_executable() -> str:
    return sys.executable


def _run_script(script_name: str, *args: str) -> subprocess.CompletedProcess:
    """Run a scripts/ entry point as a subprocess.

    Using a subprocess (not an in-process import) is important: the
    deprecated entry points exit non-zero via ``sys.exit`` and never
    write anything. We must observe that behaviour at the process
    boundary, not after import side-effects.
    """
    return subprocess.run(
        [_python_executable(), str(SCRIPTS / script_name), *args],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
        shell=False,
    )


def _synthesize_minimal_zip(target_dir: Path, files: dict[str, str], zip_name: str = "fixture.zip") -> Path:
    """Create a minimal zip at ``target_dir``/``zip_name``."""
    target_dir.mkdir(parents=True, exist_ok=True)
    zip_path = target_dir / zip_name
    with zipfile.ZipFile(zip_path, "x", compression=zipfile.ZIP_DEFLATED) as zf:
        for rel, text in files.items():
            assert "\\" not in rel and not rel.startswith("/")
            assert ".." not in rel.split("/")
            assert ":" not in rel
            info = zipfile.ZipInfo(rel)
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, text.encode("utf-8"))
    return zip_path


def _synthesize_minimal_zip_with_entry(
    target_dir: Path, name: str, payload: bytes, mode: int = 0, win_attr: int = 0
) -> Path:
    """Create a zip containing a single entry with the given metadata.

    Used to build adversarial fixtures (symlink mode bits, Windows
    reparse-point attribute, traversal names, etc.).
    """
    target_dir.mkdir(parents=True, exist_ok=True)
    zip_path = target_dir / "fixture.zip"
    with zipfile.ZipFile(zip_path, "x", compression=zipfile.ZIP_DEFLATED) as zf:
        info = zipfile.ZipInfo(name)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (mode << 16) | win_attr
        zf.writestr(info, payload)
    return zip_path


def _listdir_rel(base: Path) -> set[str]:
    """Return relative path names of everything under ``base``."""
    if not base.exists():
        return set()
    return {
        str(p.relative_to(base)).replace("\\", "/")
        for p in base.rglob("*")
    }


class DeprecatedEntryPointTests(unittest.TestCase):
    """Every legacy readiness-helper entry point must fail closed."""

    def setUp(self):
        SCRATCH.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=SCRATCH, prefix="readiness-")
        self.work = Path(self.tmp.name)
        # Snapshot the candidate evidence and artifact directories so
        # we can assert they were not touched.
        self.candidate_zip = ROOT / "artifacts" / "workflow-starter-candidate-001.zip"
        self.evidence_dir = ROOT / "docs" / "evidence" / "readiness" / "candidate-001"
        self.zip_existed = self.candidate_zip.exists()
        self.evidence_before = _listdir_rel(self.evidence_dir) if self.evidence_dir.exists() else set()
        self.zip_mtime_before = (
            self.candidate_zip.stat().st_mtime if self.zip_existed else None
        )

    def tearDown(self):
        self.tmp.cleanup()

    def test_no_arg_invocation_exits_nonzero(self):
        for script in DEPRECATED_SCRIPTS:
            with self.subTest(script=script):
                result = _run_script(script)
                self.assertNotEqual(
                    result.returncode,
                    0,
                    msg=(
                        f"{script} must exit non-zero with no args; "
                        f"got {result.returncode}\nstdout={result.stdout}\n"
                        f"stderr={result.stderr}"
                    ),
                )

    def test_no_arg_invocation_writes_no_files(self):
        for script in DEPRECATED_SCRIPTS:
            with self.subTest(script=script):
                result = _run_script(script)
                # The candidate evidence directory and the candidate
                # zip must be untouched regardless of which deprecated
                # script ran.
                evidence_after = (
                    _listdir_rel(self.evidence_dir) if self.evidence_dir.exists() else set()
                )
                self.assertEqual(
                    evidence_after,
                    self.evidence_before,
                    msg=f"{script} must not modify evidence dir",
                )
                if self.zip_existed:
                    self.assertTrue(self.candidate_zip.exists())
                    self.assertEqual(
                        self.candidate_zip.stat().st_mtime,
                        self.zip_mtime_before,
                        msg=f"{script} must not touch candidate zip",
                    )

    def test_no_arg_invocation_never_awards_score_or_release_credit(self):
        # Only ACTIVE certification patterns are forbidden; the
        # deprecation messages are explicitly allowed to mention the
        # withdrawn 10/10 score as historical context.
        forbidden = (
            "APPROVED_FOR_RELEASE",
            "score_certified",
            "READY FOR PRODUCTION",
            "10.0/10",
            "all_steps_passed",
        )
        for script in DEPRECATED_SCRIPTS:
            with self.subTest(script=script):
                result = _run_script(script)
                combined = (result.stdout or "") + (result.stderr or "")
                for needle in forbidden:
                    self.assertNotIn(
                        needle,
                        combined,
                        msg=(
                            f"{script} output must not contain {needle!r}; "
                            f"got combined output:\n{combined}"
                        ),
                    )

    def test_deprecated_script_message_explains_why(self):
        for script in DEPRECATED_SCRIPTS:
            with self.subTest(script=script):
                result = _run_script(script)
                self.assertIn(
                    "DEPRECATED",
                    result.stderr,
                    msg=f"{script} must print a DEPRECATED notice to stderr",
                )
                self.assertIn(
                    "verify_package_extracted.py",
                    result.stderr,
                    msg=(
                        f"{script} must point users at the safe replacement"
                    ),
                )


class VerifyPackageExtractedSafetyTests(unittest.TestCase):
    """The verification primitive must refuse every unsafe input."""

    def setUp(self):
        SCRATCH.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=SCRATCH, prefix="vpe-safety-")
        self.work = Path(self.tmp.name)
        self.minimal_zip = _synthesize_minimal_zip(
            self.work / "fixture-minimal",
            {
                "scripts/nd.py": (SCRIPTS / "nd.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/validate.py": (SCRIPTS / "validate.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/context_index.py": (SCRIPTS / "context_index.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/workflow_doctor.py": (SCRIPTS / "workflow_doctor.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/build_plugins.py": (SCRIPTS / "build_plugins.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/setup_project.py": (SCRIPTS / "setup_project.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/stage_project.py": (SCRIPTS / "stage_project.py").read_text(encoding="utf-8", errors="replace"),
                "AGENTS.md": "# Agent Instructions\n",
            },
        )
        self.candidate_zip = ROOT / "artifacts" / "workflow-starter-candidate-001.zip"
        self.zip_existed = self.candidate_zip.exists()
        self.zip_mtime_before = (
            self.candidate_zip.stat().st_mtime if self.zip_existed else None
        )

    def tearDown(self):
        self.tmp.cleanup()
        # Defensive: candidate zip must never be modified.
        if self.zip_existed:
            self.assertTrue(self.candidate_zip.exists())
            self.assertEqual(self.candidate_zip.stat().st_mtime, self.zip_mtime_before)

    def _run(self, *args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [_python_executable(), str(SCRIPTS / "verify_package_extracted.py"), *args],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            shell=False,
        )

    def test_no_arg_invocation_exits_nonzero_and_does_not_touch_candidate(self):
        result = self._run()
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        # The default invocation must NOT touch the real candidate.
        self.assertTrue(
            (not self.zip_existed) or self.candidate_zip.exists(),
            msg="default invocation must not delete the candidate archive",
        )
        if self.zip_existed:
            self.assertEqual(
                self.candidate_zip.stat().st_mtime,
                self.zip_mtime_before,
                msg="default invocation must not modify the candidate archive",
            )

    def test_missing_archive_exits_nonzero(self):
        out_dir = self.work / "extract-missing-archive"
        result = self._run(
            "--archive",
            str(self.work / "no-such.zip"),
            "--output-dir",
            str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(
            out_dir.exists(),
            msg="no extraction directory must be created when archive is missing",
        )

    def test_malformed_archive_exits_nonzero(self):
        bad = self.work / "bad.zip"
        bad.write_bytes(b"not actually a zip file body")
        out_dir = self.work / "extract-malformed"
        result = self._run(
            "--archive", str(bad), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_existing_output_dir_is_refused(self):
        out_dir = self.work / "extract-preexisting"
        out_dir.mkdir()
        # Drop a sentinel file; it must remain untouched.
        sentinel = out_dir / "sentinel.txt"
        sentinel.write_text("untouched", encoding="utf-8")
        result = self._run(
            "--archive", str(self.minimal_zip), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(sentinel.exists())
        self.assertEqual(sentinel.read_text(encoding="utf-8"), "untouched")

    def test_zip_with_traversal_entry_is_refused_before_extraction(self):
        traversal = _synthesize_minimal_zip_with_entry(
            self.work / "fixture-traversal",
            "../escape.txt",
            b"payload",
        )
        out_dir = self.work / "extract-traversal"
        result = self._run(
            "--archive", str(traversal), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_zip_with_absolute_entry_is_refused_before_extraction(self):
        absolute = _synthesize_minimal_zip_with_entry(
            self.work / "fixture-absolute",
            "/etc/passwd",
            b"payload",
        )
        out_dir = self.work / "extract-absolute"
        result = self._run(
            "--archive", str(absolute), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_zip_with_drive_prefix_entry_is_refused(self):
        drive = _synthesize_minimal_zip_with_entry(
            self.work / "fixture-drive",
            "C:/escape.txt",
            b"payload",
        )
        out_dir = self.work / "extract-drive"
        result = self._run(
            "--archive", str(drive), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_zip_with_backslash_entry_is_rejected_or_sanitized(self):
        # Python's zipfile writer sanitizes backslashes to forward
        # slashes on output, so a literal backslash cannot survive
        # the round-trip via ``zipfile.ZipFile.writestr``. We verify
        # that the safety script still passes the entry through its
        # name check (either by rejecting the input or by accepting
        # the sanitized forward-slash form) without ever extracting
        # into a path that escapes the output dir.
        backslash = _synthesize_minimal_zip_with_entry(
            self.work / f"fixture-backslash-{self._testMethodName}",
            "subdir\\evil.txt",
            b"payload",
        )
        out_dir = self.work / f"extract-backslash-{self._testMethodName}"
        result = self._run(
            "--archive", str(backslash), "--output-dir", str(out_dir),
        )
        # Either the script rejected the entry name during precheck (out_dir
        # does not exist) or it accepted/sanitized the name and extracted into
        # out_dir without any path escaping the destination directory.
        if out_dir.exists():
            escaped = []
            for p in out_dir.rglob("*"):
                try:
                    p.resolve().relative_to(out_dir.resolve())
                except ValueError:
                    escaped.append(str(p))
            self.assertEqual(escaped, [])

    def test_zip_with_symlink_mode_entry_is_refused(self):
        sym = _synthesize_minimal_zip_with_entry(
            self.work / "fixture-symlink",
            "link",
            b"target",
            mode=0o120000,
        )
        out_dir = self.work / "extract-symlink"
        result = self._run(
            "--archive", str(sym), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_corrupt_zip_crc_is_refused_before_extraction(self):
        # Build a valid zip, then byte-patch the CRC field of the
        # central directory entry so testzip() reports a mismatch.
        # Local file header layout (offsets from LFH start):
        #   14..17  CRC-32
        # Central directory file header layout:
        #    0..3   signature
        #    4..5   version made by
        #    6..7   version needed
        #    8..9   flags
        #   10..11  compression
        #   12..13  mod time
        #   14..15  mod date
        #   16..19  CRC-32
        good = _synthesize_minimal_zip(
            self.work / "fixture-crc-good",
            {"hello.txt": "hello world"},
        )
        data = bytearray(good.read_bytes())
        # Find the central directory signature and patch CRC there.
        cd_sig = b"PK\x01\x02"
        cd_idx = bytes(data).find(cd_sig)
        self.assertGreaterEqual(cd_idx, 0, msg="central directory signature not found")
        data[cd_idx + 16] ^= 0xFF  # flip all bits of the first CRC byte
        corrupt = self.work / "fixture-crc.zip"
        corrupt.write_bytes(bytes(data))
        out_dir = self.work / "extract-crc"
        result = self._run(
            "--archive", str(corrupt), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_out_of_workspace_archive_is_refused(self):
        import uuid
        outside_zip = Path(tempfile.gettempdir()) / f"vpe-outside-{uuid.uuid4().hex}.zip"
        _synthesize_minimal_zip(outside_zip.parent, {"x.txt": "y"}, zip_name=outside_zip.name)
        # If by chance the system temp dir lives under the workspace
        # this test is meaningless; skip cleanly.
        if outside_zip.resolve().is_relative_to(ROOT.resolve()):
            self.skipTest("system temp dir is inside workspace; cannot test outside path")
        out_dir = self.work / "extract-outside-archive"
        result = self._run(
            "--archive", str(outside_zip), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertFalse(out_dir.exists())

    def test_summary_path_does_not_overwrite_existing_file(self):
        # Pre-create the summary path the script would otherwise
        # write. The script must refuse to overwrite it.
        out_dir = self.work / "extract-summary-pre"
        expected_summary = out_dir.parent / (out_dir.name + ".verify-summary.json")
        expected_summary.write_text("PRESERVED", encoding="utf-8")
        # --skip-tool-runs keeps the test fast and side-effect free
        # beyond the summary path; we only care about overwrite refusal.
        result = self._run(
            "--archive",
            str(self.minimal_zip),
            "--output-dir",
            str(out_dir),
            "--skip-tool-runs",
        )
        self.assertNotEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(expected_summary.exists())
        self.assertEqual(
            expected_summary.read_text(encoding="utf-8"),
            "PRESERVED",
            msg="existing summary file must not be overwritten",
        )


class VerifyPackageExtractedBehaviourTests(unittest.TestCase):
    """Positive path: source-backed structured-state assertions."""

    def setUp(self):
        SCRATCH.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=SCRATCH, prefix="vpe-behav-")
        self.work = Path(self.tmp.name)
        self.minimal_zip = _synthesize_minimal_zip(
            self.work / "fixture-minimal",
            {
                "scripts/nd.py": (SCRIPTS / "nd.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/validate.py": (SCRIPTS / "validate.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/context_index.py": (SCRIPTS / "context_index.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/workflow_doctor.py": (SCRIPTS / "workflow_doctor.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/build_plugins.py": (SCRIPTS / "build_plugins.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/setup_project.py": (SCRIPTS / "setup_project.py").read_text(encoding="utf-8", errors="replace"),
                "scripts/stage_project.py": (SCRIPTS / "stage_project.py").read_text(encoding="utf-8", errors="replace"),
                "AGENTS.md": "# Agent Instructions\n",
            },
        )

    def tearDown(self):
        self.tmp.cleanup()

    def _run(self, *args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [_python_executable(), str(SCRIPTS / "verify_package_extracted.py"), *args],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            shell=False,
        )

    def test_skip_tool_runs_extracts_and_reports_structured_keys(self):
        out_dir = self.work / "extract-skip"
        result = self._run(
            "--archive",
            str(self.minimal_zip),
            "--output-dir",
            str(out_dir),
            "--skip-tool-runs",
        )
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        self.assertTrue(out_dir.is_dir())
        # Summary file is created next to --output-dir.
        summary_path = out_dir.parent / (out_dir.name + ".verify-summary.json")
        self.assertTrue(summary_path.exists())
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        self.assertTrue(summary["no_score_awarded"])
        self.assertTrue(summary["no_signoff_awarded"])
        self.assertTrue(summary["no_release_decision"])
        self.assertIn("doctor", summary)
        # The summary must never claim a score, sign-off, or release.
        serialized = json.dumps(summary)
        for forbidden in (
            "APPROVED_FOR_RELEASE",
            "score_certified",
            "READY FOR PRODUCTION",
            "10.0/10",
        ):
            self.assertNotIn(forbidden, serialized)

    def test_full_run_asserts_source_backed_structured_states(self):
        out_dir = self.work / "extract-full"
        result = self._run(
            "--archive", str(self.minimal_zip), "--output-dir", str(out_dir),
        )
        # The full run captures validate / doctor / context_check.
        # The validate step may legitimately exit non-zero on this
        # minimal fixture (it lacks a manifest); that propagates as
        # exit 3. Either 0 (passes everything) or 3 (propagates a
        # tool exit) is acceptable here; we are checking that the
        # structured state assertions were performed.
        self.assertIn(result.returncode, (0, 3), msg=result.stderr)
        summary_path = out_dir.parent / (out_dir.name + ".verify-summary.json")
        self.assertTrue(summary_path.exists())
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        # The doctor JSON, when produced, must contain the keys
        # documented in scripts/nd.py:cmd_doctor.
        doctor_obj = self._extract_first_json(summary["doctor"]["stdout"]) \
            if summary["doctor"] else None
        if doctor_obj is not None:
            for key in ("status", "project_adoption", "host_loading",
                        "application_baseline", "context_health"):
                self.assertIn(key, doctor_obj, msg=f"doctor missing {key}")
            self.assertEqual(doctor_obj["host_loading"], "UNVERIFIED")
            self.assertEqual(doctor_obj["application_baseline"], "NOT_RUN")
        # The context_check JSON must contain the keys documented in
        # scripts/context_index.py:context_check and report cache as
        # one of the documented states.
        ctx_obj = self._extract_first_json(summary["context_check"]["stdout"]) \
            if summary["context_check"] else None
        if ctx_obj is not None:
            for key in ("status", "checkpoint", "cache", "cache_freshness",
                        "host_loading", "limits"):
                self.assertIn(key, ctx_obj, msg=f"context_check missing {key}")
            self.assertEqual(ctx_obj["host_loading"], "UNVERIFIED")
            self.assertIn(
                ctx_obj["cache"], ("MISSING", "OK", "STALE", "CORRUPTED")
            )
            # Source-backed: a fresh extraction has no .nd-cache,
            # so the documented 'MISSING' state is the expected one.
            self.assertEqual(
                ctx_obj["cache"], "MISSING",
                msg="fresh extraction must report documented MISSING cache state",
            )

    def test_negative_verification_propagates_exit_code(self):
        # Minimal fixture has no package-files.json, so validate.py
        # must exit non-zero. The verify script must surface that as
        # exit 3 and refuse to certify success.
        out_dir = self.work / "extract-negative"
        result = self._run(
            "--archive", str(self.minimal_zip), "--output-dir", str(out_dir),
        )
        self.assertNotEqual(
            result.returncode, 0,
            msg="negative verification must not silently exit 0",
        )
        # Exit code 3 = "extracted tool exited non-zero".
        self.assertEqual(
            result.returncode, 3,
            msg=(
                f"negative verification must propagate as exit 3; "
                f"got {result.returncode}\nstdout={result.stdout}\n"
                f"stderr={result.stderr}"
            ),
        )
        # Even though validate failed, the script must not claim a
        # release credit anywhere in its output.
        combined = (result.stdout or "") + (result.stderr or "")
        for forbidden in (
            "VERIFICATION_COMPLETE_NO_CERTIFICATION_AWARDED",
            "APPROVED_FOR_RELEASE",
            "score_certified",
            "READY FOR PRODUCTION",
            "10.0/10",
        ):
            self.assertNotIn(forbidden, combined)

    def _extract_first_json(self, text: str):
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


class VerifyPackageExtractedNoCandidateMutationTests(unittest.TestCase):
    """End-to-end: running the script must not touch the candidate."""

    def setUp(self):
        SCRATCH.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=SCRATCH, prefix="vpe-nomut-")
        self.work = Path(self.tmp.name)
        self.candidate_zip = ROOT / "artifacts" / "workflow-starter-candidate-001.zip"
        self.evidence_dir = ROOT / "docs" / "evidence" / "readiness" / "candidate-001"
        self.zip_existed = self.candidate_zip.exists()
        self.zip_mtime_before = (
            self.candidate_zip.stat().st_mtime if self.zip_existed else None
        )
        self.evidence_before = (
            _listdir_rel(self.evidence_dir) if self.evidence_dir.exists() else set()
        )
        self.zip_sha_before = (
            __import__("hashlib").sha256(self.candidate_zip.read_bytes()).hexdigest()
            if self.zip_existed else None
        )

    def tearDown(self):
        self.tmp.cleanup()
        if self.zip_existed:
            self.assertTrue(self.candidate_zip.exists())
            self.assertEqual(self.candidate_zip.stat().st_mtime, self.zip_mtime_before)
            self.assertEqual(
                __import__("hashlib").sha256(self.candidate_zip.read_bytes()).hexdigest(),
                self.zip_sha_before,
            )
        if self.evidence_dir.exists():
            self.assertEqual(_listdir_rel(self.evidence_dir), self.evidence_before)

    def test_running_against_synthesized_zip_does_not_touch_real_candidate(self):
        synthesized = _synthesize_minimal_zip(
            self.work / "fixture-nomut",
            {
                "scripts/nd.py": (
                    SCRIPTS / "nd.py"
                ).read_text(encoding="utf-8", errors="replace"),
                "scripts/validate.py": (
                    SCRIPTS / "validate.py"
                ).read_text(encoding="utf-8", errors="replace"),
                "AGENTS.md": "# Agent Instructions\n",
            },
        )
        out_dir = self.work / "extract-nomut"
        subprocess.run(
            [
                _python_executable(),
                str(SCRIPTS / "verify_package_extracted.py"),
                "--archive", str(synthesized),
                "--output-dir", str(out_dir),
                "--skip-tool-runs",
            ],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            shell=False,
        )
        # Post-condition is enforced by tearDown snapshot comparison.


if __name__ == "__main__":
    unittest.main()
