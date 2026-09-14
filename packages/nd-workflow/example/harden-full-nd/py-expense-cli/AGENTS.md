# Agent Instructions — py-expense-cli

Hardened ND Workflow example deliverable. Self-contained; not the nd-workflow tooling itself.

## Project Identity
- System: single-module expense tracker CLI (`expense.py`) with a validated JSON store and atomic writes.
- Stack: Python 3.11+, standard library only. No pip installs, no network at runtime or in tests.
- Data: `<data-dir>/expenses.json`; resolution order `--data-dir` flag > `EXPENSE_DATA_DIR` env var > `<script dir>/data`.

## Risk Tiers
| Tier | Trigger | Required Gate |
|---|---|---|
| Low | Docs, copy, isolated test fix | Edit + run the full unittest command |
| Medium | New CLI flag, output-format change, new validation rule | Checkpoint in task record + a test for the new rule |
| High | Store schema, write path, read cap, corruption handling | Inline plan, positive and negative tests, corrupt-store and replace-failure proof |
| Critical | A change that could overwrite a store without a validated read | Block; atomic-write and fail-closed tests must pass first |

## Verification Commands (run here)
- Tests: `python -m unittest discover -s tests -v` (last observed: 26 tests, OK)
- Smoke run: `python expense.py add 12.50 food --note lunch`, then `list`, `total`

## Scope Limits
- Tests must stay deterministic and write only inside a temporary directory.
- Never weaken a rejection to make a test pass; add a test for every new behavior.
- Do not add dependencies, network calls, or packaging. Keep output ordering deterministic.
