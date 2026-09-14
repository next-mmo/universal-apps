"""DEPRECATED entry point.

The previous version of this script:
- Unconditionally deleted artifacts/workflow-starter-candidate-001.zip
  if it existed, then rebuilt it in place.
- Overwrote docs/evidence/readiness/candidate-001/manifest.json with
  the new SHA-256 and size, mutating the authoritative evidence ledger
  as part of the same run that produced the new artifact.

Both behaviors are unsafe: they silently destroy the prior artifact
and the prior evidence record without an explicit, reviewed action.
The bogus 10/10 release score that depended on this output has been
withdrawn.

This entry point is retained only as a deprecation marker.
- No zip is deleted or rebuilt.
- No manifest, evidence file, or any other path is written,
  overwritten, or deleted.
- Exit code is non-zero so automation fails closed.

The safe replacement is the read-only primitives
``scripts/package.py --output <new-path>`` (exclusive-create, refuses
to overwrite an existing artifact) and ``scripts/verify_package_extracted.py``
(non-certifying verification of an extracted candidate archive).
Rebuilding the candidate archive and updating its manifest must be a
deliberate, human-reviewed action performed by a separate maintainer.
"""
from __future__ import annotations

import sys

DEPRECATION_MESSAGE = (
    "DEPRECATED: scripts/rebuild_candidate_zip.py is disabled.\n"
    "Reason: the previous version deleted the existing candidate\n"
    "  archive and overwrote the authoritative manifest in the same\n"
    "  run, and supported the withdrawn bogus 10/10 release score.\n"
    "Replacement:\n"
    "  - scripts/package.py --output <new-path> is the safe build\n"
    "    primitive (exclusive-create, refuses to overwrite).\n"
    "  - scripts/verify_package_extracted.py is the safe, non-certifying\n"
    "    verification primitive (explicit --archive and --output-dir).\n"
    "  - Rebuilding the candidate and updating its manifest must be\n"
    "    a deliberate, human-reviewed action performed by a separate\n"
    "    maintainer; never automated in a single step.\n"
    "This script does NOT delete, rebuild, or overwrite any archive,\n"
    "  manifest, or evidence file."
)


def main() -> int:
    sys.stderr.write(DEPRECATION_MESSAGE + "\n")
    return 2


if __name__ == "__main__":
    sys.exit(main())
