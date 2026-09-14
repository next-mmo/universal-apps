"""DEPRECATED entry point.

The previous version of this script:
- Unconditionally deleted artifacts/workflow-starter-candidate-001.zip
  and reran nd index build before recording evidence.
- Overwrote every log under docs/evidence/readiness/candidate-001/commands/
  and the results_summary.json in the same run that produced them.
- Did not require any human sign-off or independent review.

This conflates "recording evidence" with "producing the evidence",
and was the upstream source for the bogus 10/10 release score that
has been withdrawn.

This entry point is retained only as a deprecation marker.
- No nd index build is run.
- No zip is deleted or rebuilt.
- No evidence file is written, overwritten, or deleted.
- Exit code is non-zero so automation fails closed.

The safe replacement is the read-only verification primitive
scripts/verify_package_extracted.py (explicit --archive, --output-dir,
no overwrites, no certification). Recording authoritative candidate
evidence must be a deliberate, human-reviewed action performed by a
separate maintainer against already-produced command outputs.
"""
from __future__ import annotations

import sys

DEPRECATION_MESSAGE = (
    "DEPRECATED: scripts/record_candidate_evidence.py is disabled.\n"
    "Reason: the previous version deleted the candidate archive,\n"
    "  rebuilt the index, and overwrote the entire candidate evidence\n"
    "  ledger in a single run, and supported the withdrawn bogus\n"
    "  10/10 release score.\n"
    "Replacement:\n"
    "  - scripts/verify_package_extracted.py is the safe, non-certifying\n"
    "    verification primitive (explicit --archive and --output-dir).\n"
    "  - Recording authoritative candidate evidence must be a\n"
    "    deliberate, human-reviewed action performed by a separate\n"
    "    maintainer; never automated in a single step.\n"
    "This script does NOT delete, rebuild, or overwrite any archive,\n"
    "  index, command log, summary, or evidence file."
)


def main() -> int:
    sys.stderr.write(DEPRECATION_MESSAGE + "\n")
    return 2


if __name__ == "__main__":
    sys.exit(main())
