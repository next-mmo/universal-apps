# Documentation Catalog

Read the matching topic, not every document. Search relevant source/docs if an entry is missing or stale. Integration owner maintains shared routes; current documents describe reality, proposals describe intended changes.

| Topic | Canonical path | Read when |
|---|---|---|
| Plugin distribution | [PLUGINS.md](PLUGINS.md) | Claude Code, Cursor, Codex build/install routes and limits |
| Guided setup and migration | [ONBOARDING.md](ONBOARDING.md) | Fresh/existing project, Superpowers cutover, doctor and recovery |
| Adoption and portable checks | [START-HERE.md](../START-HERE.md) | Installing starter, changing agent tool, validating distribution |
| Project orientation | [PROJECT.md](../.agents/docs/PROJECT.md) | Setup, commands, access routes, ownership |
| System architecture | [ARCHITECTURE.md](../.agents/docs/ARCHITECTURE.md) | Boundaries, data flow, contracts, decisions |
| Delivery and integration | [WORKFLOW.md](../.agents/docs/WORKFLOW.md) | Risk gates, parallel work, current-doc reconciliation, release |
| Resume and cold handover | [HANDOVER.md](HANDOVER.md) | Pausing, transferring ownership, verifying successor readiness; `nd context check` and `nd context locate` resume routes |
| Task tracking | [tasks/README.md](tasks/README.md) | Locate exact active task or archived evidence |
| QA and developer handoff | [QA contract](../.agents/skills/nd-user-testing/references/qa-handoff.md) | Round events, bug status, task/PRD routing, evidence and retest closure |
| Project-aware QA | [Project profiles](../.agents/skills/nd-user-testing/references/project-profiles.md) | App/game/CLI/workflow plan initialization and evidence-backed improvement proposals |
| Change proposals | [prd/README.md](prd/README.md) | Unresolved product scope and history, not current behavior |
| Larger plans | [plans/README.md](plans/README.md) | Complex design or integration phases |
| Plan template | [PLAN.md](../.agents/templates/PLAN.md) | Multi-phase architectural transitions or refactoring |
| Operations template | [RUNBOOK.md](../.agents/templates/RUNBOOK.md) | Adopted system deploys or owns persistent data |
| Benchmark tradeoffs and limits | [BENHMARK.md](../BENHMARK.md) | Policy fit, competitor comparisons, evidence boundaries and 9.7 challenge checklist |
| Context indexing benchmark | `INDEXING-BENHMARK.md` | Repository-level retrieval comparison, protocol and cross-IDE handover evidence |
| Top-2 competitive benchmark | `docs/TOP2-COMPETITIVE-BENCHMARK-AND-HARDENING.md` | Historical ND measurements and comparison notes requiring revalidation; not current-candidate release evidence |
| Release readiness audit | `docs/RELEASE-READINESS-AND-BENCHMARK-AUDIT.md` | Repository-level benchmark audit, verified claims matrix, unverified limits and release gates |
| Internal readiness target | `docs/prd/prd-0005-internal-release-readiness.md` | Evidence-first 9.7 internal readiness scope, phased gates and authorization record; not an earned score or competitor ranking |
| Release readiness scorecard | `docs/RELEASE-READINESS-SCORECARD.md` | Withdrawn certification, current evidence limits and unresolved release gates; no earned score |
| Candidate-002 evaluation report | `docs/evidence/readiness/candidate-002/EVALUATION-REPORT.md` | Fresh local evaluation results, byte-identical package hash, and explicit blockers |

## Project-specific routes

At adoption, add canonical feature/API documents, relevant operations runbook, and significant decision records here. Reuse existing locations; no mandatory empty directories. For small systems, feature behavior can live in existing docs; larger systems may use capability specs.

| Topic | Canonical path | Read when |
|---|---|---|
| Not adopted | Root orientation files remain reusable templates | Adopt from actual target-project source |
| Runnable todo example | [GUIDE.md](../example/full-stack-todo-express-vanillajs/GUIDE.md) | Local full-stack setup, API, architecture, tests and recovery |
| Runnable CMS portfolio | [GUIDE.md](../example/full-stack-nd-workflow-cms-portfolio/GUIDE.md) | Full-stack CMS with auth, admin dashboard, and full .agents adoption |
| Hardened expense CLI example | `example/harden-full-nd/py-expense-cli/` | Repository Python stdlib CLI reference with ND workflow and hardening evidence |
| Hardened logstat tool example | `example/harden-full-nd/py-logstat/` | Repository Python stdlib log parsing tool with bounded streaming and ND workflow |
| Hardened markdown link checker | `example/harden-full-nd/js-md-links/` | Repository Node.js built-in link checker with traversal protection and ND workflow |

Avoid duplicating lifecycle status in this index; proposal/task files own it. Coordinator updates routes when targets are created, moved, or retired.
