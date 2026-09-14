"""DEPRECATED entry point.

The previous version of this script awarded an "APPROVED_FOR_RELEASE"
decision and a 10/10 score after running a self-built checklist against
its own freshly-written evidence. A single automated script cannot be
both the agent under review and the independent reviewer; the bogus
10/10 was withdrawn and the entry point disabled.

Usage of this script is unsafe and intentionally fails closed:
- No files in docs/evidence/readiness/candidate-001/ are read,
  written, deleted, or overwritten.
- No zip is rebuilt, no manifest is updated, no score is awarded.
- Exit code is non-zero so any automation that still references this
  path fails immediately.

The authoritative independent review must be performed by a separate
human maintainer following docs/HANDOVER.md ("Cold handover acceptance
drill") and recorded manually in the evidence ledger. The safe,
non-certifying verification primitive is scripts/verify_package_extracted.py,
which requires explicit --archive and --output-dir arguments and never
overwrites any existing path.
"""
from __future__ import annotations

import sys

DEPRECATION_MESSAGE = (
    "DEPRECATED: scripts/run_independent_review.py is disabled.\n"
    "Reason: a script cannot independently review its own work or\n"
    "  certify human/maintainer sign-off. The previous 10/10 score\n"
    "  produced by this entry point was withdrawn as bogus.\n"
    "Replacement:\n"
    "  - scripts/verify_package_extracted.py is the safe, non-certifying\n"
    "    verification primitive (explicit --archive and --output-dir).\n"
    "  - Real independent review and human sign-off must be performed\n"
    "    and recorded manually in docs/evidence/readiness/candidate-001/.\n"
    "This script does NOT read, write, delete, or overwrite any file\n"
    "and does NOT award any score, sign-off, or release credit."
)


def main() -> int:
    sys.stderr.write(DEPRECATION_MESSAGE + "\n")
    return 2


if __name__ == "__main__":
    sys.exit(main())
