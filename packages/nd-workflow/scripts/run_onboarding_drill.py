"""DEPRECATED entry point.

The previous version of this script:
- Unconditionally deleted .validation/onboarding-drill-run/clean-project
  before each run.
- Unconditionally deleted docs/evidence/readiness/candidate-001/onboarding_drill_result.json
  and rewrote it from this same script.
- Asserted that the local extraction drill is equivalent to a real
  external human developer following START-HERE.md, and reported
  "all_steps_passed": true as authoritative evidence.

None of those behaviors are safe: a script that erases prior evidence
and replaces it with a self-authored "PASS" record is not a real
drill, and the bogus 10/10 score that depended on this output has
been withdrawn.

This entry point is retained only as a deprecation marker.
- No zip is extracted.
- No fixture directory is created or deleted.
- No evidence file is written, overwritten, or deleted.
- Exit code is non-zero so automation fails closed.

The safe replacement is the read-only verification primitive
scripts/verify_package_extracted.py (explicit --archive, --output-dir,
no overwrites, no certification). Real human onboarding drills must
be performed and recorded by a separate maintainer following
docs/HANDOVER.md and the onboarding protocol in
docs/evidence/readiness/candidate-001/onboarding_protocol.md.
"""
from __future__ import annotations

import sys

DEPRECATION_MESSAGE = (
    "DEPRECATED: scripts/run_onboarding_drill.py is disabled.\n"
    "Reason: the previous version deleted fixture directories,\n"
    "  rewrote authoritative onboarding evidence from this same\n"
    "  script, and was the sole source for a withdrawn bogus 10/10\n"
    "  release score.\n"
    "Replacement:\n"
    "  - scripts/verify_package_extracted.py is the safe, non-certifying\n"
    "    verification primitive (explicit --archive and --output-dir).\n"
    "  - Real onboarding drills must be performed and recorded manually\n"
    "    in docs/evidence/readiness/candidate-001/ following the\n"
    "    onboarding_protocol.md template.\n"
    "This script does NOT extract any archive, does NOT delete or\n"
    "  rewrite any fixture or evidence file, and does NOT award\n"
    "  any score, sign-off, or release credit."
)


def main() -> int:
    sys.stderr.write(DEPRECATION_MESSAGE + "\n")
    return 2


if __name__ == "__main__":
    sys.exit(main())
