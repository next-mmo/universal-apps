# Documentation Catalog — py-expense-cli

Read the matching topic, not every document. Verify commands against source when docs
disagree; this example's docs describe the state observed on 2026-09-11.

| Topic | Path | Read when |
|---|---|---|
| Agent policy (identity, risk tiers, verification commands, scope limits) | [../AGENTS.md](../AGENTS.md) | Before editing anything in this example |
| How to run the CLI, exact commands and observed output | [../README.md](../README.md) | First contact with the project; running commands |
| System architecture: modules, data flow, trust boundaries | [../.agents/docs/ARCHITECTURE.md](../.agents/docs/ARCHITECTURE.md) | Changing validation, store, or write-path code |
| Project orientation: purpose, runtime, exact commands with last observed results | [../.agents/docs/PROJECT.md](../.agents/docs/PROJECT.md) | Setup, reproducing runs, ownership/access questions |
| Delivery workflow adopted by this example | [../.agents/docs/WORKFLOW.md](../.agents/docs/WORKFLOW.md) | Risk gates, checkpoints, converge-check usage |
| Hardening evidence log (measures, commands, outputs, limits) | [../HARDENING.md](../HARDENING.md) | Auditing hardening claims or adding new hardening |
| Completed task record done-0001 | [tasks/done/done-0001-py-expense-cli.md](tasks/done/done-0001-py-expense-cli.md) | Reviewing what was built, why, and the observed evidence |

Notes: there is no separate API spec because the CLI surface in README.md is the complete
contract; there is no runbook because the example deploys nothing (reason recorded in
PROJECT.md). Keep entries here in sync when files move or retire.
