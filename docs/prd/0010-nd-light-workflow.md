---
id: "0010"
title: "ND Light Workflow (ndl) for small applications"
status: draft
last-audit: 2026-09-23
---

# Change Proposal: A lightweight delivery workflow (`ndl`) for small applications

ND Light Workflow is a second, deliberately smaller delivery profile beside ND Workflow: same
vocabulary and same canonical paths, a fraction of the artifacts, no Python, and one optional
enforcement command. It targets a small app built largely by one agent session, where ND Workflow's
PRD + evidence-ledger + doc-budget + token-inventory + plugin machinery costs more than the app.

## Problem and scope

- **User / problem / desired outcome:** a developer starting a small app (single deployable, few
  files, one worker) currently has two bad options: adopt ND Workflow and pay its full artifact
  surface, or work with no workflow at all and lose the guarantees that matter (risk gating,
  evidence over claims, a task board, human approval). The desired outcome is a third option: a
  workflow small enough that adopting it is never the expensive part of the day, but strict enough
  that unverified work cannot be presented as done.
- **Measured baseline for "heavy" (repository state, 2026-09-23):** `packages/nd-workflow` is 226
  source files / ~20,100 lines; its adoption engine writes **28 files, 88,439 bytes, ≈22,110
  estimated tokens**; validation hard-requires 13 files plus 12 skill files; root `AGENTS.md` is
  budget-capped at 450 words (currently 448, so a consumer edit can fail the validator); it requires
  Python 3.10+ plus an optional Node launcher; the `context check` READY gate requires an evidence
  ledger, exactly one active task, a fresh context index, and catalog anchors.
- **In scope:** definition and delivery of the ND Light Workflow package (`packages/nd-light-workflow`,
  npm name `@next-mmo/nd-light-workflow`, command `ndl`, skill prefix `ndl-`): the starter file set,
  one-line-per-rule policy docs, three adopted skills, one optional zero-dependency Node CLI with
  four commands, a package test suite, and the escalation (promotion) path to full ND Workflow.
- **Non-goals:** changing ND Workflow itself (it stays the heavyweight profile, unchanged); a new or
  competing document standard inside ND-adopted repositories; npm registry publication; migrating
  any existing ND-adopted project to `ndl`; a UI, daemon, network service, or telemetry; a second
  example application in the package; GitHub-toolkit or generated-code concerns.
- **Selected requirements / open questions:** requirements NDL-01 – NDL-13 below are the proposed
  scope **as drafted**; the five decisions in "Open questions for approval" are the parts most likely
  to change on review. Clarification answers are selection input, not approval.

## Approval record

- **Scope approval:** pending (draft).
- **Approver / decision date:** unset.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** unset; this
  draft body is the revision under review.
- **Approval evidence:** none yet. This document was drafted from an explicit specification request
  on 2026-09-23 ("create nd-light-workflow with prefix ndl, inspired by nd-tookit/.agents"), which
  authorizes drafting only.
- **Execution authorization:** not authorized. Implementation of `packages/nd-light-workflow`,
  root script wiring, and CI changes each require a separate explicit implementation request.
- **Scope changes since approval / renewed decision needed:** n/a (draft).

## Canonical targets and baseline

- **New capability — no baseline exists.** The intended canonical targets after implementation are:
  - `packages/nd-light-workflow/` (new package: manifest, `bin/`, `src/`, `starter/`, `tests/`,
    `README.md`) — the profile itself.
  - `docs/prd/0000-prd-index.md` — the row for this PRD (added with this draft).
  - `CONTEXT.md` and `.agents/docs/ARCHITECTURE.md` workflow-ownership rows — extended at
    implementation time to name the profile boundary (workflow ownership: which profile owns policy,
    which owns enforcement).
  - `package.json` (root) — optional `ndl` script; `docs/development.md` — the verified command row.
- **Existing behavior this must not disturb:** `packages/nd-workflow/**` (no edits), the root
  workflow gates `pnpm workflow:check`, `pnpm docs:check`, `pnpm nd:check`, `pnpm nd:doctor`.
- **Design source (inspiration, not a dependency):** `nd-tookit/.agents` (read-only reference on this
  machine). Adopted from it: risk-tier gating stated as prose in `AGENTS.md` rather than a phase-gate
  engine; filename-status task board with a `>` metadata block; one stdlib script as the only
  enforcement mechanism; the conventions "one fact, one home / filename is status / evidence over
  claims / human approves scope". Explicitly **not** adopted: its repo-specific automation
  (8-file version sync, app scaffolder), its 44-document PRD tree, the three-way roadmap split, and
  the proposals/retrospective machinery (which exists there to correct rules that drifted).
- **Integration owner / related concurrent changes:** this repository's maintainer (the approver);
  no other concurrent change targets `packages/` workflow tooling. Sequencing constraint: the
  single-in-progress rule in `.agents/scripts/workflow-check-core.mjs` allows only one `wip-` task,
  so implementation must take that slot when it is free. At drafting time it was held by `wip-0015`;
  that task was closed on 2026-09-23 to `docs/tasks/done/done-0015-verification-foundation.md`, and
  the slot now carries `wip-0017` (ND adoption document closure).

## Requirement changes

### ADDED

**NDL-01 — Markdown-first, tool-optional.** The workflow is fully usable from the copied files alone.
Given a project that has copied the starter and has no runtime installed, when a session follows
`AGENTS.md` and `.agents/docs/WORKFLOW.md`, then board rules, risk gating, and evidence recording are
usable with no CLI present.

**NDL-02 — Bounded footprint.** Given `ndl init --apply` on an empty project, when adoption
completes, then at most 12 files were written and the mandatory-read set (`AGENTS.md`,
`.agents/docs/WORKFLOW.md`, `.agents/docs/ROADMAP.md`) estimates ≤ 1,500 tokens using
`ceil(utf8Length / 4)` — against the measured ND baseline of 28 files / ≈22,110 tokens.

**NDL-03 — Preview before write; idempotent apply.** `ndl init` prints an `add / reuse / conflict`
line per file and writes nothing. `--apply` writes only after that preview. Given an already-adopted
project, when `ndl init --apply` runs again, then every path reports `reuse` and no file changes.
Given a target file whose bytes differ from the starter, then it reports `conflict` and is never
overwritten without an explicit `--force`.

**NDL-04 — Board model.** Tasks live in `docs/tasks/` as `todo-`, `wip-`, or `blocked-<id>-<slug>.md`,
with completed work in `docs/tasks/done/done-<id>-<slug>.md`. Filename is the status; a task's
`> **Status:**` line, when present, must agree with its prefix. At most one `wip-` task exists.
`.agents/docs/ROADMAP.md` carries the board: Active (≤5), Blocked, Recently completed (≤5).

**NDL-05 — Risk tiers are preserved verbatim in vocabulary.** Low = scoped edit + focused check, no
task file required, no spec. Medium = task file with inline plan + focused integration check.
High = approved scope, plan, affected build/integration proof, recovery note. Critical = High gates
plus positive and negative cases and human signoff on an isolated representative environment. A
one-line change to authentication, payments, or persisted data is Critical; prose about those
subjects is not automatically Critical.

**NDL-06 — The spec is optional and one page.** A PRD is created only for unresolved product scope or
High/Critical risk. Given a Low- or Medium-risk change whose requirements are clear, when work
starts, then the task's inline plan is the plan and no PRD file exists. Specs are one page: problem,
scope, acceptance list, decision record.

**NDL-07 — Evidence over claims.** Every task marked done records the exact command (or inspection)
and the observed result; a check that was not run is stated as not run with the reason. No unverified
pass is ever reported as a pass. Documentation-only changes verify links and formatting, not builds.

**NDL-08 — One enforcement command with named failure modes.** `ndl check` exits non-zero when any of
these hold: (a) more than one `wip-` task; (b) a task's declared status contradicts its filename
prefix; (c) `ROADMAP.md` drift — a task listed as active that is not `todo-`/`wip-` on disk, or an
active task absent from the board; (d) a broken relative Markdown link in a guarded file; (e) a
required starter file is missing. Each failure mode has a test that fails without the check.

**NDL-09 — Zero-dependency Node runtime, no Python.** `ndl` runs on Node ≥ 20 (the package declares
`engines.node`), with no dependencies, no network access, and no Python. Absence of Node degrades to
NDL-01 (files only), not to a broken workflow.

**NDL-10 — One workflow per repository, with a documented promotion path.** When ND Workflow markers
are also present (`.nd-workflow-adoption/`, `nd-*` skills, or ND's evidence-ledger sections), the
check reports a finding naming them so a human decides; `ndl` never rewrites ND artifacts. The
starter documents the promotion triggers (authentication/payments/security/data-integrity work;
more than one concurrent worker; production deployment with persistent data; release packaging; a
spec with more than five acceptance criteria; repeated board drift) and the file-role mapping to ND.
The `ndl` layout reuses ND's canonical paths (`docs/prd/`, `docs/tasks/`, `.agents/docs/`,
`.agents/skills/`, `.agents/templates/`) so promotion moves no files.

**NDL-11 — Skill set is small and bounded.** Three skills are adopted: `ndl-task` (board inventory,
claim, handoff, drift check), `ndl-check` (focused verification and evidence recording),
`ndl-spec` (one-page spec drafting). Each is ≤ 60 lines. Adoption guidance lives in the package
(`ndl-setup`), is not copied into the target, and therefore needs no exclusion list.

**NDL-12 — Package tests.** A `node --test` suite covers adoption preview/apply/idempotency/conflict,
the five `ndl check` failure modes plus a passing baseline, and the `new` / `done` lifecycle renames.
It runs as `pnpm --filter @next-mmo/nd-light-workflow test` with no Python and no network.

**NDL-13 — Honest distribution and honest limits.** Distribution routes are: manual copy of the
starter directory (first-class, NDL-01), `node <path>/packages/nd-light-workflow/bin/ndl.mjs`, or a
locally built tarball. No registry publication is implied, and publication is a separate human
decision. The README states the limits plainly: no certification, no measured token-saving claim, no
guarantee that a host loads the instructions automatically.

### MODIFIED

- None. ND Workflow's current documents keep describing current behavior; nothing in
  `packages/nd-workflow/**` changes.

### REMOVED

- None. No existing requirement, artifact, or gate is retired by this proposal.

## Design impact and decisions

**Deliverable layout (proposed).**

```
packages/nd-light-workflow/
  package.json            @next-mmo/nd-light-workflow, bin "ndl", engines.node >= 20, no deps
  bin/ndl.mjs             launcher (imports src/cli.mjs)
  src/cli.mjs             argument parsing and command dispatch
  src/commands/*.mjs      init, new, check, done
  src/lib/*.mjs           board parsing, guarded-file links, byte-exact file writes
  starter/                copied verbatim into a target project; no exclusion list
    AGENTS.md             <= 400 words: fast path, risk tiers, board, DoD, escalation
    .agents/docs/WORKFLOW.md     one page: risk table, 6-step lifecycle, context budget
    .agents/docs/ROADMAP.md      the board: Active / Blocked / Recently completed
    .agents/templates/TASK.md    metadata block + plan + acceptance + verification record
    .agents/templates/PRD.md     one page
    .agents/skills/ndl-task|ndl-check|ndl-spec/SKILL.md
    .agents/skill-selection.json
    docs/tasks/README.md, docs/prd/README.md
  tests/*.test.mjs        node --test
  README.md               what it is, adoption, commands, limits, promotion path
```

**Decisions recorded (with the alternatives rejected).**

| # | Decision | Rejected alternative and why |
| :--- | :--- | :--- |
| D1 | Ship as a sibling package, `@next-mmo/nd-light-workflow` | A "light profile" inside `packages/nd-workflow` would inherit the 105-entry manifest, the 450-word `AGENTS.md` validator budget, the Python core, and the token/doc-budget machinery — the exact weight being removed. |
| D2 | Zero-dependency Node CLI, no Python | ND's Python core is required for ND's validators and packaging; for a small JS/TS app, requiring Python ≥ 3.10 to *run a workflow* is the cost the profile exists to avoid. Cross-language reuse was judged low-value against that. |
| D3 | `starter/` is the copy root, copied with no exclusion list | Mirroring ND's `.agents/**`-is-both-dev-and-shipped layout forces an exclusion list (ND excludes 3 skills, 2 docs) plus link rewriting into excluded files. One directory that means exactly one thing removes a whole class of adoption bugs. |
| D4 | Risk vocabulary identical to ND's | A simplified 3-tier scale would drift: promotion to ND would reclassify work, and the same change would have two names. Lightness comes from *how often* a tier is invoked, not from renaming tiers. |
| D5 | Specs stay at `docs/prd/` with a one-page template | A new `docs/specs/` directory reads lighter but breaks promotion without file moves and invents a second standard — the thing NDL-10 forbids. |
| D6 | Board = `ROADMAP.md` lists + filename status, enforced by one command | An in-file status field or a ticket database adds state to keep in sync; the inspiration repo's single stdlib drift script is the pattern that survived contact with real use. |
| D7 | No adoption journal; `init` never overwrites | ND writes a hash-bound journal with `recovery.json` for 28 files across many hosts. For ≤ 12 files in a project that is (or will be) a Git repository, `git` is the recovery mechanism; `reuse`/`conflict` reporting plus `--apply` is the safety boundary. |
| D8 | No bundled example application; tests use temporary directories | ND ships two adopted example apps (~9,800 lines) as evidence. That is real value for a distributable framework and real weight for a profile whose whole claim is smallness; fixtures prove the same behaviors. |
| D9 | Explicit non-goals: no doc budgets or token inventory, no evidence ledger, no parallel-worker/lane contract, no runbook template, no plugin bundles for six hosts, no feedback/proposal machinery, no version-bump automation | Each is justified at ND's scale; each is a mandatory-looking artifact a small app does not need. Listing them keeps the boundary reviewable instead of implied. |

**Design risks.**

- The main risk is a third process standard rather than a smaller one: two profiles that drift into
  different vocabulary or different paths would cost more than either alone. NDL-10's shared paths
  and D4's shared vocabulary are the mitigations, and the promotion mapping is the acceptance test.
- A second risk is under-verification creep: "light" can be read as "no checks". NDL-05, NDL-07, and
  the Critical tier are not negotiable in the profile, and `ndl-check` states them explicitly.
- Adoption-detection overlap (a repo containing both profiles) is handled as a reported finding, not
  an automatic resolution — a human decides (NDL-10).

## Open questions for approval

Each has a recommended default; the PRD is implementable as drafted if all recommendations are accepted.

1. **Package identity and location** — recommended: sibling package `packages/nd-light-workflow`
   (npm `@next-mmo/nd-light-workflow`, bin `ndl`), independent of `packages/nd-workflow`.
   Alternative: a subdirectory/profile inside `packages/nd-workflow`.
2. **Runtime** — recommended: zero-dependency Node ≥ 20 core. Alternative: a Python core with a Node
   launcher, for exact parity with ND's toolchain (and Python as a stated prerequisite).
3. **Skill count** — recommended: three adopted skills (`ndl-task`, `ndl-check`, `ndl-spec`) plus the
   package-only `ndl-setup`. Alternatives: two (drop `ndl-spec`, spec drafting folded into
   `ndl-task`), or five (add change-logging and periodic-retrospective skills).
4. **Optional documents** — recommended: ship opt-in templates for a vision statement and a
   product changelog, adopted only when requested. Alternative: adopt them by default (mirrors the
   inspiration repo's doc set, adds two files to every adoption).
5. **Command surface** — recommended: `ndl init`, `ndl new`, `ndl check`, `ndl done`. Alternative:
   `init` and `check` only (everything else is a file rename an agent can do).

## Acceptance and delivery

- [ ] **Footprint and parity measured, not asserted:** `ndl init --apply` on a temporary directory
      writes ≤ 12 files; the mandatory-read estimate is ≤ 1,500 tokens; a table in the package README
      shows both numbers against the recorded ND baseline (28 files / ≈22,110 tokens).
- [ ] **Self-consistent on first run:** `ndl check` exits 0 on a freshly adopted project, and exits
      non-zero on each of the five seeded drift cases in NDL-08, proven by tests that fail without it.
- [ ] **Tool-optional proof:** a copy of the starter with no CLI, no Node runtime, and no Python can
      still carry a task from `todo-` to `done-` with a recorded result — demonstrated by following
      the files alone.
- [ ] **Promotion mapping reviewed:** the ndl→nd mapping table names every file and role, uses ND's
      canonical paths, and contains no file that must be moved or renamed to promote.
- [ ] **No regression to existing gates:** `pnpm workflow:check`, `pnpm docs:check`, `pnpm test`,
      `pnpm nd:check`, and `pnpm nd:doctor` behave exactly as before the change; `packages/nd-workflow`
      is untouched.
- **Pre-existing baseline defect (found while drafting on 2026-09-23; not caused by this proposal and
  not fixed by it):** `pnpm nd:doctor` exits 2 with `ERROR: Invalid skill selection`, because
  `.agents/skill-selection.json` lists 19 skills including non-ND ones (`tauri-universal-ui*`,
  `security-audit`, `browser-agent-setup`), while `.agents/scripts`-adjacent
  `packages/nd-workflow/scripts/workflow_doctor.py` (line 143) requires every selected name to be one
  of its 12 canonical ND skills. `PROJECT.md` still records that command as verified. The working tree
  held only this proposal's three documentation paths when the failure was observed, so it predates
  this work. Repairing it is its own scoped change; here, "no regression" means "unchanged", so
  implementers must not treat `nd:doctor` as a green baseline, and must not "fix" it by editing this
  package.
- [ ] **Honest limits documented:** README states no publication, no certification, no measured
      token-saving claim, no automatic-instruction-discovery guarantee (NDL-13).
- **Risk / required approvals / rollback constraints:** Medium. A new isolated package plus
  documentation; no existing consumer behavior, public contract, or runtime path changes. Because the
  artifact is process policy, the approval gate carries more weight than the tier. Rollback is
  deletion of the new package and its root wiring; no persistent state, migration, or deployment is
  involved, and existing ND-adopted projects are unaffected. Registry publication is explicitly out
  of scope and would need its own approved scope.
- **Sequencing constraint:** the single-in-progress rule in
  `.agents/scripts/workflow-check-core.mjs` permits one `wip-` task, so implementation of this PRD
  needs that slot free. `wip-0015` held it at drafting time and closed on 2026-09-23; `wip-0017`
  holds it now. Promote `todo-0016` when the slot frees and settle the ordering with the maintainer.
- **Current-doc reconciliation plan:** after implementation, compare against the recorded baseline
  (ND's README/START-HERE footprint claims and this PRD's measurements), then update the canonical
  workflow-ownership rows — `CONTEXT.md`, `.agents/docs/ARCHITECTURE.md` (profile boundary and which
  artifact owns which policy), `docs/development.md` (the `ndl` command row with observed results),
  and this PRD's status with its evidence links. `packages/nd-workflow` documents keep describing ND
  as current behavior and are not rewritten; this proposal stays as history.
- **Implementation, integration, and deployment gates:** implementation (new package, tests, package
  README) → integration (root script wiring, the reconciliation edits above, and existing gates
  re-run green) → deployment: **not applicable** except for an explicitly approved publication step,
  which is out of scope here and recorded as pending rather than delivered.
