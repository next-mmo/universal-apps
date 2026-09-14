# Local evaluation report: Candidate-002

- **Candidate ID:** `candidate-002`
- **Date:** 2026-09-11
- **Evaluation kind:** Local automated suite only.
- **Readiness score:** **UNASSESSED.** PRD-0005 target is >=9.7/10 with mandatory gates.
- **Release gate:** **BLOCKED.** Not approved for release.
- **Evaluation artifacts:**
  - `artifacts/readiness-correction/workflow-starter-candidate-002-evaluation.zip` (SHA-256: `38ddc0e4224f47b2803d00016fc170d86f865268d7e2ee3730532a74be4f763b`, 205,852 bytes, 91 files).
  - Repeat build is byte-identical: `artifacts/readiness-correction/workflow-starter-candidate-002-repeat.zip`.
  - Evidence ledger: [`docs/evidence/readiness/candidate-002/`](evidence/readiness/candidate-002/).

---

## Measured local observations

All commands were run against frozen input hashes (`input-manifest.json`):

1. `python scripts/validate.py`: PASS (91 manifest files, 0 errors, 42 files checked).
2. `python -m unittest discover -s tests -p 'test_*.py' -v`: 188 ran, 181 passed, 7 skipped on Windows symlink privileges, 0 failures.
3. Hardened examples:
   - `py-expense-cli`: 26 passed, 0 failures.
   - `py-logstat`: 26 passed, 0 failures.
   - `js-md-links`: 19 passed, 0 failures.
4. Full-stack examples:
   - `full-stack-todo-express-vanillajs`: `check` pass, `test:api` 15 passed, 0 failures.
   - `full-stack-nd-workflow-cms-portfolio`: `check` pass, `test:api` 21 passed, 0 failures.
5. Extracted package verification (`scripts/verify_package_extracted.py`):
   - Package CRC and entry paths verified before extraction.
   - Extracted to `.validation/eval-extract-candidate-002`.
   - `validate.py` in extracted root: exit 0.
   - `nd doctor` in unadopted template: exit 1 (`status: ATTENTION`, expected).
   - `nd context check`: exit 2 (`status: ATTENTION`, cache missing, expected).
   - No score or release decision awarded.

---

## Why 9.7 readiness remains unearned

PRD-0005 v0.1 requires five categories (25/25/20/20/10). Passing local commands does not satisfy the rubric:

| Category | Missing evidence / blocker |
|---|---|
| **S — Safety** | Seven symlink tests were skipped due to Windows privilege; required path/symlink safety assertions must be verified on an enabled environment. Clean-fixture protected recovery repeated runs require candidate-bound logging. |
| **C — Correctness** | CI matrix includes macOS and Python 3.10, but remote execution results are not captured. |
| **E — Evidence** | Independent maintainer review of raw outputs and clean-fixture reproduction (E3) has not been performed. Token Plan exhaustion prevented external subagent review; self-authored check cannot substitute. |
| **H — Hosts & users** | H1–H3 require fresh host drills on the declared candidate. H4 requires a non-author human developer to run onboarding from published instructions. |
| **U — Usability** | U1–U3 require human elapsed time, correction counts, and verified recovery without outside help. |

---

## Delivery status

- Local candidate ZIP and verification logs are delivered for evaluation.
- False certification records for candidate-001 have been withdrawn and backed up.
- Unsafe auto-certification scripts have been replaced with safe verification tools and 20 passing regression tests.
- Production release, push, and tagging remain BLOCKED pending human onboarding, remote CI verification, and independent maintainer signoff.
