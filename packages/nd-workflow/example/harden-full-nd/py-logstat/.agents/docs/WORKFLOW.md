# Workflow — py-logstat

This example adopts ND Workflow: work is classified by risk tier (low: edit
and check; medium: task record plus full test suite; high/critical: plan,
negative tests, and converge-check before closure), multi-step or
pause-prone work keeps a durable checkpoint in `docs/tasks/`, and completed
work is only marked done with observed evidence recorded in the task record
and `HARDENING.md`. The binding policy, risk gates, and verification rules
live in the parent repo: `../../../.agents/docs/WORKFLOW.md`; project-local
scope limits and exact verification commands are in `AGENTS.md` and
`docs/README.md`.
