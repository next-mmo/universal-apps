# Project Orientation — py-expense-cli

Populated from observed runs on 2026-09-11 (Windows, Python 3.11.13).

## Purpose and entry points
- Name / purpose / supported users: `py-expense-cli` — the ND Workflow "full hardening"
  example deliverable: a small expense tracker CLI showing risk tiers, checkpoints and
  evidence in practice. Audience: developers evaluating ND Workflow; single local user.
- Main entry points and source links: [`expense.py`](../../expense.py) (`main(argv)` and
  `python expense.py <command>`); tests in [`tests/test_expense.py`](../../tests/test_expense.py).
- Runtime/version pins: Python 3.11+ (verified 3.11.13), standard library only. No package
  manager, lockfile, services, or OS-specific service dependencies.
- [Architecture](ARCHITECTURE.md): single module, JSON store, atomic replace, fail-closed reads.
- Canonical current behavior/API docs: [README.md](../../README.md) (commands, exit codes),
  [HARDENING.md](../../HARDENING.md) (measures, evidence, limits).

## Reproduce development
| Action | Exact command | Working directory/source | Last observed result |
|---|---|---|---|
| Approved dependency setup | none required (stdlib only) | `example/harden-full-nd/py-expense-cli` | N/A — no install step; Python 3.11.13 already present |
| Configuration and service startup | none required | same | N/A — no service; config is `--data-dir` / `EXPENSE_DATA_DIR` |
| Safe test data/seed and migrations | none required (tests self-seed temp stores) | same | N/A — single JSON store, no migrations |
| Development entry point | `python expense.py --help` | same | usage text printed, exit 0 |
| Targeted tests/type checks | `python -m unittest discover -s tests -v` | same | `Ran 26 tests in 0.430s` / `OK` |
| CLI smoke | `python expense.py add 12.50 food --note lunch`, `python expense.py list`, `python expense.py total` | same | `added 12.50 food`; deterministic list lines; `total: 19.75` |
| CI-equivalent checks | same unittest command (this example has no CI config of its own) | same | see above |
| Build/package when applicable | none | same | N/A — source-only example, no build artifact |

- Required configuration names: `EXPENSE_DATA_DIR` (optional data-dir override) or the
  `--data-dir PATH` flag; safe default is `<script dir>/data`. No secrets exist; never
  store secret values in the store file (it is plain JSON).
- Team-owned access-request route and prerequisite permissions: none — the example runs
  locally with the invoking user's own file permissions.
- Known setup failures, recovery instructions, and unresolved verification: a corrupt or
  oversized store makes every command exit 1 with `error: store file ...`; recovery is a
  deliberate manual fix or removal of `expenses.json`, never an automatic overwrite.

## Operations and ownership
- Deployable service/persistent data? No service to deploy. Persistent data is the local
  `expenses.json` only, so no runbook is required — N/A because there is no deploy target
  or shared environment; back up by copying the file.
- Responsible team/role and escalation route: maintained as part of the nd-workflow
  examples; changes go through the repository's normal review path.
- Deployment, monitoring, backup/restore references: N/A — no deployment or monitoring;
  restore = copy a saved `expenses.json` back into the data directory.
- Public vulnerability-reporting policy location: N/A — example project, not a published
  product; report issues through the nd-workflow repository.

## Agent adoption
- Tool/version, instruction loading and selected skill route: adopted in the nd-workflow
  repo; Codex/OpenCode-style tools load [`AGENTS.md`](../../AGENTS.md), Claude Code loads
  [`CLAUDE.md`](../../CLAUDE.md) which is one line: `@AGENTS.md`.
- Observed fresh-session check, date, and unchecked integrations: files were verified
  statically on 2026-09-11; no fresh interactive agent session was run against this
  example, so instruction-loading in a new session remains unchecked.
- Workspace/network/approval boundaries: writes are confined to this example directory;
  runtime and tests require no network and no elevated permissions.
- Recheck after tool/config changes; see [workflow guide](WORKFLOW.md).

## Durable knowledge and open risks
- Rule: every rejection exits 1 and never modifies the store; store reads are capped at
  1 MiB; failed writes clean up their temp file. Evidence: HARDENING.md §3–§4.
- Rule: output ordering is deterministic (sort by `created`, then `id`; JSON `sort_keys=True`).
- Open risk: concurrent writers can lose updates (no lock file) — owner: example
  maintainer; next action: add locking only if this example grows into a real tool.
