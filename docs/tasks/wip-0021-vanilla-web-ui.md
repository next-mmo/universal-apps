# Task 0021: Vanilla Web UI source target

> **Status:** wip
> **Type:** feature
> **Created:** 2026-09-29
> **PRD:** `docs/prd/0015-vanilla-web-ui.md`

Implement PRD 0015 as a first-class source-owned vanilla web target.

## Goal and scope

- Outcome: companies can use the same Universal CLI flow with plain web platform UI: `init --framework vanilla`, `add button`, and `create --framework vanilla`.
- Approved scope / execution evidence: six-part vanilla implementation plan approved by the user with "do it" on 2026-09-29.
- Risk: High because this adds a public CLI framework contract and source-distribution package. No auth, payments, security, destructive data, or production deployment.
- Branch: `feat/vanilla-ui`, based on `main`.
- Owned paths: `packages/ui-vanilla/**`, `packages/cli/source/**`, `packages/cli/test/source*.mjs`, `scripts/build-source-registry.mjs`, `scripts/check-source-*.mjs`, source-distribution docs, and PRD/task/index reconciliation.

## Plan

1. Add vanilla to CLI validation, config, list/add selection, create templates, and framework-aware short-name resolution.
2. Add `packages/ui-vanilla` with light-DOM Custom Elements, shared tokens, and counterparts for the current UI primitive catalog.
3. Update registry graph/package inventory so vanilla entries are emitted as framework `vanilla`.
4. Extend packed smoke and compile gates; make the vanilla compile result blocking once green.
5. Update README/source CLI docs and architecture/product maps.
6. Run focused source tests, build, smoke, and vanilla compile; record exact results.

## Acceptance criteria

- `add button` resolves to the correct framework-local implementation for React and vanilla.
- `add --all --framework vanilla` selects vanilla + shared package aggregates only.
- `create --framework vanilla --no-install` writes a plain Vite starter and `universal.json`.
- Generated vanilla source has no framework runtime imports.
- Vanilla smoke and compile gates pass without weakening any existing verified framework.
- No existing framework behavior is intentionally changed.

## Evidence ledger

- 2026-09-29 — repository orientation completed from `AGENTS.md`, `CONTEXT.md`, workflow/architecture docs, PRD 0002, source CLI guide, graph/install code, and source verification scripts.
- 2026-09-29 — implementation authorized; branch created.
- 2026-09-29 — implementation committed on `feat/vanilla-ui`; PR #14 opened and marked ready for review.
- 2026-09-29 — Vercel status for head `ed1e99d1a6853f7d04f35c65a7b9fdf303cc3116`: success.
- 2026-09-29 — GitHub Actions at handoff: `Source distribution` and `Agent Workflow` are in progress; no pass is claimed yet because this environment cannot execute the repository checkout locally.

## Resume state

Implementation is on `feat/vanilla-ui` and PR #14. Framework plumbing, `ui-vanilla`, starter, smoke/compile gates, and docs are committed. Remaining closure step: inspect the in-progress GitHub Actions results and fix any failures before moving this task to `done/`.
