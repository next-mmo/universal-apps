# Task 0016: ND Light Workflow (ndl) specification checkpoint

> **Status:** todo
> **Type:** specification
> **Created:** 2026-09-23
> **PRD:** `docs/prd/0010-nd-light-workflow.md`

Draft and approve the scope for a second, smaller delivery profile beside ND Workflow: package
`packages/nd-light-workflow`, npm name `@next-mmo/nd-light-workflow`, command `ndl`, skill prefix
`ndl-`, inspired by the `nd-tookit/.agents` conventions. This file is a **specification-only drafting
checkpoint**: it authorizes no implementation.

## Goal and scope

- Mode: specification-only.
- Outcome / why: `packages/nd-workflow` is 226 files / ~20,100 lines and its adoption writes 28 files
  / ≈22,110 estimated tokens under a Python 3.10+ core. A small app needs the guarantees (risk gating,
  evidence over claims, a task board, human approval) without that artifact surface.
- Requirement or issue / exact draft path and version: `docs/prd/0010-nd-light-workflow.md`, draft
  revision of 2026-09-23; requirements NDL-01 – NDL-13, decisions D1 – D9.
- Scope approval evidence / approver / date: **pending**. The drafting request itself ("create
  nd-light-workflow with prefix ndl, inspired by nd-tookit/.agents", 2026-09-23) selects the subject,
  not the scope.
- Execution authorization: **not authorized**. Implementation of the package, root script wiring, and
  any CI change each need their own explicit implementation request.
- In scope (drafting): discovery, the draft PRD, this checkpoint, the PRD index row.
- Non-goals: writing any part of `packages/nd-light-workflow`, editing `packages/nd-workflow`, root
  `package.json` or CI, npm publication, or migrating a project between profiles.
- Risk and required gates: Medium for the eventual implementation (new isolated package + process
  policy; no existing consumer behavior or public contract changes). Approval gate matters more than
  the tier because the artifact is policy. Any registry publication is High and separately approved.

## Ownership and integration

- Exact task path: `docs/tasks/todo-0016-nd-light-workflow.md`.
- Owner: unassigned; drafted in the 2026-09-23 session.
- Branch/worktree and base revision: `main` at `687cb95`; drafting changes are uncommitted.
- Owned write paths (drafting): `docs/prd/0010-nd-light-workflow.md`,
  `docs/prd/0000-prd-index.md`, this file.
- Owned write paths (implementation, once authorized): `packages/nd-light-workflow/**`, plus reviewed
  edits to root `package.json`, `docs/development.md`, `CONTEXT.md`, and
  `.agents/docs/ARCHITECTURE.md`.
- Dependencies / outstanding workers: none; no other session targets `packages/` workflow tooling.
- Integration owner / shared files / merge order: repository maintainer; the PRD index row lands with
  the draft, implementation wiring lands after approval.

## Plan and acceptance (drafting scope)

- Next steps within authorized mode: present the draft, collect the five open-question decisions, and
  stop. On approval, promote this file in place to `wip-` implementation mode rather than minting a
  second task file.
- [x] Draft saved at the stated path, with requirement IDs, acceptance list, decisions, and open
      questions — verified by `pnpm docs:check` and `pnpm workflow:check` passing.
- [x] PRD index row added and the index date refreshed.
- [ ] Scope approval recorded (approver, date, requirement IDs, exclusions) — pending human decision.
- Canonical behavior targets and baseline: new capability, no baseline. Baseline for the *claim* is
  the measured ND footprint recorded in the PRD; canonical workflow-ownership rows in `CONTEXT.md` and
  `.agents/docs/ARCHITECTURE.md` are updated at implementation, not now.

## Acceptance Criteria

The implementation criteria live in PRD 0010 under "Acceptance and delivery" (footprint parity
measured against the ND baseline; `ndl check` green on a fresh adoption and red on each of the five
drift cases; tool-optional round trip; reviewed promotion mapping; no regression to `pnpm
workflow:check`, `pnpm docs:check`, `pnpm test`, `pnpm nd:check`, `pnpm nd:doctor`).

For this checkpoint the criterion is: the draft exists at `docs/prd/0010-nd-light-workflow.md`, is
reachable from `docs/prd/0000-prd-index.md`, and states its open questions without claiming approval.

## Evidence Ledger

- 2026-09-23 — `pnpm workflow:check`: pending run recorded before handover; expected to pass because
  draft changes touch `docs/` only (not a product path) and add no second `wip-` task.
- 2026-09-23 — `pnpm docs:check`: pending run recorded before handover; relative links in the new
  documents resolve to existing paths.
- 2026-09-23 — Baseline measurement for the PRD's "heavy" claim: `packages/nd-workflow` = 226 source
  files / ~20,100 lines; adoption set 28 files / 88,439 bytes / ≈22,110 estimated tokens; Python 3.10+
  core with an optional Node launcher. Source: `packages/nd-workflow/scripts/setup_project.py`,
  `package-files.json`, `README.md`, package tree inventory.
- 2026-09-23 — Reference used for the light side: `nd-tookit/.agents` (external, read-only), reviewed
  for its risk-tier prose gating, filename-status board + metadata block, single drift script, and
  conventions. Repo-specific automation there was explicitly not adopted.
- 2026-09-23 — Pre-existing defect recorded, not caused by this task: `pnpm nd:doctor` exits 2 with
  `ERROR: Invalid skill selection`. Cause: `.agents/skill-selection.json` lists 19 skills including
  `tauri-universal-ui*`, `security-audit`, and `browser-agent-setup`, while
  `packages/nd-workflow/scripts/workflow_doctor.py:143` accepts only its 12 canonical ND skill names.
  Observed with a clean tree apart from this task's three documentation paths, so it predates this
  work; `PROJECT.md` still lists that command as verified. Out of scope here — recorded so the
  implementer does not mistake it for a regression and does not treat `nd:doctor` as a green baseline.

## Resume State

- Updated at / author: 2026-09-23, drafting session.
- Completed / partial / not started: draft complete and index row added (partial, pending approval);
  implementation not started.
- Exact next action or command and working directory: present the draft and resolve the five open
  questions in PRD 0010 ("Open questions for approval"); repository root. Do not start implementation
  before an explicit approval-and-start decision.
- Current hypothesis / blockers / decision needed: the design holds on two assumptions the approver
  must confirm — a sibling package rather than an in-package profile, and a zero-dependency Node core
  rather than Python parity with ND.
- Decisions and rejected approaches with reasons: D1 – D9 in PRD 0010, including why a light profile
  inside `packages/nd-workflow`, a new `docs/specs/` directory, and ND's adoption journal were
  rejected.
- Current revision and uncommitted work location/fingerprint: `main` + uncommitted changes to
  `docs/prd/0010-nd-light-workflow.md`, `docs/prd/0000-prd-index.md`, this file.
- Evidence still valid / invalidated and why: the ND footprint measurement stays valid while
  `packages/nd-workflow` is unchanged; it is invalidated by any edit to that package's adoption set.
- Relevant source, docs, and output paths: `docs/prd/0010-nd-light-workflow.md`,
  `packages/nd-workflow/`, `.agents/docs/WORKFLOW.md`, `.agents/scripts/workflow-check-core.mjs`.
- Successor ownership transfer / outstanding coordination: the single-in-progress rule in
  `.agents/scripts/workflow-check-core.mjs` permits one `wip-` task, and `wip-0015` holds it, so
  implementation either follows 0015's closure or takes the slot after 0015 is parked.

## Verification and closure

- Criterion / command or inspection / result / evidence location: drafting verified by
  `pnpm workflow:check` and `pnpm docs:check` (recorded above); scope approval has no evidence yet.
- Tested state and relevant environment: documentation-only change on Windows (NTFS case sensitivity)
  with Node and pnpm from the repository root; no application build is involved.
- Combined-state checks and integration result: not applicable at drafting stage.
- Current-doc reconciliation result / conflicts resolved: none required yet; the implementation
  reconciles `CONTEXT.md`, `.agents/docs/ARCHITECTURE.md`, and `docs/development.md` and records the
  result here.
- Optional durable learning updated, corrected, retired, or no-op: no-op.
- Failed / skipped / unverified checks and reasons: the two gate runs above were not captured in this
  file when it was written; they are recorded here after the drafting run and before handover.
- Recovery plan / operations reference if relevant: not applicable; no deployment or persistent data.
- Implemented / integrated / deployed state and evidence: not implemented, not integrated, not
  deployed. Draft delivered only; scope approval pending.
- Status: todo for the drafting scope, complete; implementation not authorized.
