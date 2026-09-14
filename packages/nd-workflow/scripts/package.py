#!/usr/bin/env python3
"""Package the workflow-starter distribution as an exclusive ZIP.

Validates the repo first via ``scripts/validate.py``. If validation
fails, no output is created. On success, the script:
- Resolves the output path and refuses to write if it resolves outside
  the repo root, is an existing symlink, or collides with a source
  file listed in the manifest.
- Safely creates the output parent directory (mkdir -p) AFTER
  validation passes.
- Opens the destination ZIP in exclusive-create mode (``x``) so any
  concurrent creation between the precheck and the open fails
  atomically with FileExistsError; the pre-existing file is preserved
  and not deleted.
- Verifies CRC, exact entry set, byte identity with source.
- Reports artifact path, count, size, SHA-256, and per-entry hashes.

Safety:
- Destination must NOT exist (exclusive-create).
- No deletion of any path.
- Validates before any write.
- Reports errors with non-zero exit.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import load_manifest, validate_repo  # noqa: E402


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _is_under(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
    except ValueError:
        return False
    return True


def _check_output_path(
    root: Path, output: Path, source_files: list[str]
) -> list[str]:
    """Reject output that resolves outside root, is a symlink, or
    collides with a manifest source file. Symlink ancestors that
    escape the root are also rejected. Containment is always checked,
    regardless of whether the file currently exists."""
    errors: list[str] = []
    root_resolved = root.resolve(strict=False)
    try:
        output_resolved = output.resolve(strict=False)
    except OSError as exc:
        return [f"output resolve error: {exc}"]
    # 1. Containment: always required.
    if not _is_under(output_resolved, root_resolved):
        errors.append(
            f"output resolves outside the repo root: {output_resolved}"
        )
    # Reject link/reparse components before dereferencing the destination.
    for component in (output, *output.parents):
        if component == root_resolved:
            break
        reparse = (sys.platform == 'win32' and component.exists()
                   and bool(component.lstat().st_file_attributes & 1024))
        if component.is_symlink() or reparse:
            errors.append(f"output contains symlink/reparse component: {component}")
            break
    # 3. If file exists, it must not collide with a manifest source.
    if output.exists():
        for rel in source_files:
            src_resolved = (root / rel).resolve(strict=False)
            if src_resolved == output_resolved:
                errors.append(
                    f"output path collides with manifest source: {rel}"
                )
                break
    return errors


def package_repo(root: Path, output: Path) -> dict:
    """Validate then build the archive. Returns a structured result dict."""
    output = output.absolute()
    root_resolved = root.resolve(strict=False)

    # 1. Run full validation first (no writes).
    report = validate_repo(root)
    if report["status"] != "PASS":
        return {
            "status": "FAIL",
            "stage": "validate",
            "errors": report["errors"],
        }

    # 2. Load manifest allowlist.
    data, load_errors = load_manifest(root)
    if load_errors:
        return {"status": "FAIL", "stage": "manifest", "errors": load_errors}
    files = list(data["files"])

    # 3. Output path safety: under root, not a symlink, no source collision.
    output_path_errors = _check_output_path(root, output, files)
    if output_path_errors:
        return {
            "status": "FAIL",
            "stage": "output_path",
            "errors": output_path_errors,
        }

    # 4. Output must not exist (exclusive-create precheck; 'x' mode
    #    below is the actual atomic guard).
    if output.exists() or output.is_symlink():
        return {
            "status": "FAIL",
            "stage": "precheck",
            "errors": [
                f"output already exists (exclusive-create refused to"
                f" overwrite): {output}"
            ],
        }

    # 5. Safely create the output parent directory only after all
    #    checks above have passed.
    if not output.parent.exists():
        try:
            output.parent.mkdir(parents=True, exist_ok=False)
        except OSError as exc:
            return {
                "status": "FAIL",
                "stage": "mkdir",
                "errors": [f"output parent mkdir error: {exc}"],
            }

    # 6. Build the ZIP in exclusive-create mode. If a race creates
    #    the file between the precheck above and the open, 'x' will
    #    raise FileExistsError and the existing file is preserved.
    file_hashes: dict[str, str] = {}
    try:
        with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED) as zf:
            for rel in files:
                src = root / rel
                if not src.exists() or src.is_symlink():
                    return {
                        "status": "FAIL",
                        "stage": "create",
                        "errors": [f"source missing or is symlink: {rel}"],
                    }
                data_bytes = src.read_bytes()
                file_hashes[rel] = _sha256_bytes(data_bytes)
                info = zipfile.ZipInfo(rel)
                info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(info, data_bytes)
    except FileExistsError:
        return {
            "status": "FAIL",
            "stage": "create",
            "errors": [
                f"output already exists at open time (race preserved it): {output}"
            ],
        }
    except OSError as exc:
        return {"status": "FAIL", "stage": "create", "errors": [f"ZIP write error: {exc}"]}

    # 7. Verify: CRC, exact entry set, byte identity.
    with zipfile.ZipFile(output, "r") as zf:
        bad = zf.testzip()
        if bad is not None:
            return {
                "status": "FAIL",
                "stage": "verify",
                "errors": [f"ZIP CRC failure: {bad}"],
            }
        names = sorted(zf.namelist())
        if names != sorted(files):
            return {
                "status": "FAIL",
                "stage": "verify",
                "errors": ["ZIP entries differ from manifest allowlist"],
            }
        for rel in files:
            if zf.read(rel) != (root / rel).read_bytes():
                return {
                    "status": "FAIL",
                    "stage": "verify",
                    "errors": [f"byte mismatch for {rel}"],
                }

    artifact_bytes = output.read_bytes()
    return {
        "status": "PASS",
        "artifact": str(output),
        "entries": len(files),
        "size_bytes": output.stat().st_size,
        "sha256": _sha256_bytes(artifact_bytes),
        "file_sha256": file_hashes,
        "checks": [
            "Validation pass before any write",
            "Exclusive-create: refused to overwrite existing destination",
            "Atomic 'x' mode: race between precheck and open fails closed",
            "Output path under repo root; not a symlink; no source collision",
            "Output parent dir created only after successful validation",
            "ZIP CRC verified",
            "Exact allowlist match",
            "Byte-identical to source files",
        ],
    }


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Package the workflow-starter distribution (validate first, then ZIP)."
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Output ZIP path (must not exist; exclusive-create).",
    )
    parser.add_argument(
        "--root",
        default=None,
        help="Repo root (default: parent of scripts/).",
    )
    args = parser.parse_args(argv)
    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parent.parent
    output = Path(args.output).absolute()
    result = package_repo(root, output)
    print(json.dumps(result, indent=2, default=str))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
