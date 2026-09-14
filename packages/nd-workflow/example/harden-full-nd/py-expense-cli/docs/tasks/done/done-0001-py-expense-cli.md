# Task done-0001 — py-expense-cli hardening example

## Goal and approved scope
- Create ONE fully hardened, real, runnable example project at
  `example/harden-full-nd/py-expense-cli`: a Python standard-library-only expense tracker
  CLI (`add`, `list`, `total`), a >= 12-case unittest suite, and the ND Workflow document
  set (AGENTS.md, CLAUDE.md, .agents/docs, docs catalog, this task record, HARDENING.md).
- Constraints: no pip installs; no network at runtime or in tests; tests deterministic and
  confined to temporary directories; never report an unobserved result.
- Risk: High for the store write/read path (data integrity, atomic replace, corrupt-store
  handling); Medium for CLI validation; Low for prose.

## Ownership and integration
- Owner / integration: Worker session `mvs_6d4d0ff13adf4c5caf2c73f236d198f5`
  (parent `mvs_3ff09dcbef3243c5bdd515853158a204`).
- Write scope: `example/harden-full-nd/py-expense-cli/**` only; nothing written outside it.
- No other writers touched this directory during the task (created fresh; no pre-existing
  files under the slug).

## Implementation plan
- [x] Inspect repository conventions (root AGENTS.md, docs catalog, sibling examples).
- [x] Write `expense.py`: argparse CLI, Decimal amounts, sanitizing, atomic JSON store,
      fail-closed load path, deterministic ordering.
- [x] Write `tests/test_expense.py`: unittest, temp-dir isolation, every hardening case
      plus the simulated `os.replace` failure.
- [x] Run the suite until green; run CLI smoke + error-path evidence.
- [x] Write README.md, AGENTS.md, CLAUDE.md, HARDENING.md, .agents/docs/*, docs/README.md
      and this record with the observed results only.

## Acceptance criteria and observed results
- [x] **Stdlib only, no network** — `expense.py` imports stdlib only; AST test
  `test_source_has_no_network_imports` passed. No install step performed. Observed.
- [x] **Commands** `add`, `list [--category]`, `total [--month YYYY-MM]` — exercised by the
  smoke run and the suite; outputs `added 12.50 food`, deterministic list lines,
  `total: 19.75`, `total 2026-09: 19.75`. Observed.
- [x] **Atomic JSON persistence** `data/expenses.json` via temp file + `os.replace` —
  `test_successful_write_leaves_no_temp_files` passed; with `os.replace` patched to raise,
  `test_atomic_replace_failure_preserves_store_and_cleans_temp` passed (exit 1, store bytes
  unchanged, no temp leftovers). Observed.
- [x] **Reject non-numeric / negative / NaN / infinite / absurdly large amounts** — 7
  non-numeric values, 4 non-positive values, 8 non-finite forms (5 CLI + 3 validator),
  3 oversized values all exit 1 with `error: amount ...`. Observed.
- [x] **Cap note (200) and category (40) length** — boundary 200/40 accepted, 201/41 rejected
  with exit 1. Observed.
- [x] **Strip control characters** — NUL, ESC, BEL, LF, U+202E, U+200B removed from stored
  category/note and from the raw JSON bytes. Observed.
- [x] **Reject unknown month formats** — 7 malformed values (`2026-13`, `2026-00`, `2026-1`,
  `2026/01`, `abc`, `2026-01-01`, empty) exit 1. Observed.
- [x] **Corrupt/unreadable store never silently overwritten** — corrupt JSON, empty file and
  invalid-record stores exit 1 on `list`/`total`/`add` with unchanged bytes (sha256 equal);
  a directory at the store path is reported as unreadable. Observed.
- [x] **Cap store read size** — 1 MiB + 1 byte store exits 1 with
  `error: store file exceeds the 1048576 byte size limit`. Observed.
- [x] **Deterministic output ordering** — sorted by `(created, id)`; repeated `list`
  produced identical output; JSON written with `sort_keys=True`. Observed.
- [x] **Test suite >= 12 cases** — 26 test methods, all passing. Observed.
- [x] **Documents present** — all eight document files created with populated content and
  the required catalog/task record. Observed (file list in §Evidence).

## Verification evidence
Environment: Windows, Python 3.11.13; working directory
`C:\Users\dila\Documents\GitHub\nd-workflow\example\harden-full-nd\py-expense-cli`.

```
$ python -m unittest discover -s tests -v
...
Ran 26 tests in 0.430s

OK
```

```
$ python expense.py --help
usage: expense [-h] [--data-dir DATA_DIR] {add,list,total} ...
exit=0
```

Smoke run against a scratch `EXPENSE_DATA_DIR` (temp dir):

```
$ python expense.py add 12.50 food --note lunch
added 12.50 food                      # exit 0
$ python expense.py add 7.25 transport
added 7.25 transport                  # exit 0
$ python expense.py list
2026-09-10T20:03:25Z       12.50  food  lunch
2026-09-10T20:03:25Z        7.25  transport
$ python expense.py total
total: 19.75
$ python expense.py total --month 2026-09
total 2026-09: 19.75
```

Error-path capture (subprocess, exact stderr):

```
$ python expense.py add nan food          -> exit 1: error: amount must be a finite number: 'nan'
$ python expense.py add -5 food           -> exit 1: error: amount must not be negative: '-5'
$ python expense.py add 1000000.01 food   -> exit 1: error: amount must not exceed 1000000: '1000000.01'
# store pre-filled with "{broken json":
$ python expense.py add 1.00 food         -> exit 1: error: store file is corrupt and was not modified: ...
corrupt store unchanged: True; tmp leftovers: []
```

Full evidence log: [HARDENING.md](../../../HARDENING.md).

## Final handoff
- Status: **completed** for the stated example scope. No commit, tag, push, or publication
  was performed (not authorized).
- Deliverables: `expense.py`, `tests/test_expense.py`, `README.md`, `AGENTS.md`,
  `CLAUDE.md`, `.agents/docs/PROJECT.md`, `.agents/docs/ARCHITECTURE.md`,
  `.agents/docs/WORKFLOW.md`, `docs/README.md`, `docs/tasks/done/done-0001-py-expense-cli.md`,
  `HARDENING.md` (11 files).
- Limits: no multi-process locking, no directory fsync, single environment (Windows /
  Python 3.11.13), store must match the tool's canonical form (BOM-prefixed stores are
  rejected fail-closed). Full list in HARDENING.md §5.
- Next developer: run the unittest command from the project directory, then the smoke
  commands in README.md; extend tests for any new validation rule before changing behavior.
