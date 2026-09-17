# Task 0006: Agent-token benchmark round 1 — three UI strategies

> **Status:** wip  
> **Type:** measurement  
> **Created:** 2026-09-17  
> **PRD:** `docs/prd/0004-agent-token-benchmark.md`

Build a token-measurable three-arm benchmark under `apps/benchmark/**` that compares the shared
`@package/pro` CRUD block, plain Tailwind, and vendored shadcn-style primitives on one frozen
workload, instrumented with host-reported counters, then execute the authorized smoke and report it.

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: Approved 2026-09-17 — three-strategy scope (`ask_1b2f39cd28ecc269f3480c65`), then the build plus the three-session smoke with selective git tracking and a UI-layer-only workload (`ask_bfd3c9a7b2bb9dff821a4632`).
- Execution authorization: Granted for the round-1 smoke only — three sessions, one run per arm, on the pinned model. The repeat runs to reach three paired runs per arm are **not** authorized; the owner deferred them to a report-then-decide step and every run consumes paid tokens.
- Exact next action: report round 1 and obtain a decision on PRD 0004 Open question 1 — whether to repair the Our arm's frame before the repeats, and whether that repair invalidates round 1.

## Goal and scope

- Mode: measurement plus the harness that makes the measurement reproducible.
- Outcome / why: consumers ask which of the three UI strategies costs an agent fewer tokens to build. The removed round answered in `ceil(chars/4)` estimates and recorded the billed-token result as unmeasurable, and repository policy forbids savings claims from character heuristics. This round replaces the proxy with host-reported usage.
- Requirement or issue: [`docs/prd/0004-agent-token-benchmark.md`](../prd/0004-agent-token-benchmark.md), status `approved`, requirements ATB-01–ATB-06.
- In scope and delivered: the restored three-arm substrate under `apps/benchmark/**`; the frozen workload specification and three matched arm briefs; the round protocol; the capture, compare, and per-turn breakdown instruments; the executed round-1 smoke with independently verified outcomes; the evidence record; PRD 0004 and its index row.
- Non-goals: any monetary claim, any published single-run percentage, the counter-app scenario (PRD 0003), restoring `apps/benchmark.md` or its conclusions, changing the reuse-first policy, and the repeat runs, which are unauthorized.

## Discovery record

- The three-arm fixture and its 31 files were recovered from `06eae0f^` and the tracked `apps/todo-full-stack-benchmark.zip`; the reference UI was then removed so all arms start substrate-only.
- A positive control ran first: all three arms passed `test` and `build` with the original fixture UI present, proving the substrate and toolchain independently of any authored source, and reproducing the removed report's bundle figures.
- The capture instrument was validated against known ground truth before measuring anything unknown: it reproduced the published Alert counters exactly (ND `turns=16 total=483,386 fresh=85,306`, baseline `turns=20 total=775,589 fresh=96,037`).
- The model pin is not host-confirmable — every delegated run reported `model_verdict: missing` — but the session records themselves confirm `ocg/deepseek-v4.1-flash` on `custom_provider:9route` for all three arms.
- The Our arm's frame is defective: its `vite.config.ts` registers only `@vitejs/plugin-react` and its `package.json` omits `@tailwindcss/vite`, so the Tailwind utilities its `@package/pro` blocks depend on are never generated. Inherited from the removed round, not introduced here.
- The Our arm's cost is dominated by a provider-cache artifact rather than by strategy: 12 turns beyond the expected warm-up re-sent the whole context uncached, accounting for 1,056,895 tokens (86% of its uncached input). The other two arms never lost the cache after warm-up.

## Ownership and integration

- Exact task path: `docs/tasks/wip-0006-agent-token-benchmark-round-1.md`.
- Owner / team; session ID: Mavis (integration owner) / session `mvs_8c85c29304824f9c842b4d05a9887854`.
- Branch/worktree and base revision: repository root, base `ec942a5`.
- Owned write paths: `apps/benchmark/**`, `docs/prd/0004-agent-token-benchmark.md`, `docs/prd/0000-prd-index.md`, `docs/tasks/wip-0006-agent-token-benchmark-round-1.md`, `docs/evidence/token-benchmark-three-ui-strategies.md`, `pnpm-workspace.yaml`, `.gitignore`.
- Dependencies / outstanding workers: none. No other task was active on the board.
- Integration owner / shared files / merge order: `pnpm-workspace.yaml` and `.gitignore` are shared; both changes are additive and confined to `apps/benchmark`. No merge ordering constraint.

## Plan and acceptance

- Canonical behavior/architecture targets; baseline and requirement IDs: `docs/prd/0004-agent-token-benchmark.md` ATB-01–ATB-06; policy context in `docs/prd/nd-token-efficiency.md` NTE-05 (draft) and `agent/evals.md`. Baseline `ec942a5`.
- Completion state: the authorized smoke is complete and verified; the unauthorized repeat runs remain open, so this task stays in progress rather than closing.

## Acceptance Criteria

- [x] Three arms exist under `apps/benchmark/**` with byte-identical shared frame files, differing only in UI strategy.
- [x] All three arms pass `test` and `build` with the original fixture UI present (positive control) before that UI is removed.
- [x] A frozen workload specification and three matched briefs exist, differing only in the strategy section.
- [x] The capture instrument reproduces the published Alert counters exactly before being used on new data.
- [x] All three smoke runs executed on the pinned model with reasoning effort off, one fresh session per arm, sequentially.
- [x] Every arm's outcome independently verified by the orchestrator: `test` exit 0 with 4 assertions, `build` exit 0.
- [x] Host-reported counters captured for all three arms with the model pin confirmed from the records.
- [x] The compare table quotes the fresh figure beside `totalTokens` and carries its limits, including the cache artifact, in the same document.
- [x] PRD 0004 written and indexed in `docs/prd/0000-prd-index.md`; evidence recorded in `docs/evidence/token-benchmark-three-ui-strategies.md`.
- [ ] Owner decision recorded on PRD 0004 Open question 1: repair the Our-arm frame before the repeats, and whether round 1 is invalidated.
- [ ] Repeat runs executed to reach three paired runs per arm, reported as median with range — **not authorized**; requires a new owner decision.
- [ ] Repository gates pass on the increment.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Capture instrument is trustworthy | `scripts/capture-tokens.mjs` reproduced the published Alert counters exactly: ND `turns=16 total=483,386 fresh=85,306 cacheRead=398,080`; baseline `turns=20 total=775,589 fresh=96,037 cacheRead=679,552` | Verified 2026-09-17 before any new measurement |
| Substrate and toolchain work independently of authored source | All three arms passed `test` + `build` with the original fixture UI: 1,919 / 35 / 36 modules; JS 496.77 / 199.62 / 200.08 kB | Verified 2026-09-17 |
| Arm frames are matched | `src/domain.ts`, `src/domain.test.ts`, `src/model.ts`, `src/main.tsx` hash identically across all three arms (SHA-256 prefixes `F75FAC55…`, `62CEABDE…`, `4EB64628…`, `EA204630…`) | Verified 2026-09-17 |
| All three arms achieved equal outcome | Orchestrator-run `pnpm --filter @benchmark/todo-full-stack-{our,tailwind,shadcn} test` and `build`: `test` exit 0 with 4 assertions each; `build` exit 0 each (1,919 / 35 / 36 modules) | Verified 2026-09-17 |
| No arm needed repair turns | Each arm passed both acceptance commands on its first attempt; no retry appears in any of the three sessions | Verified 2026-09-17 |
| Model pin held | Every captured turn in all three arms reports `model: ocg/deepseek-v4.1-flash`, `provider: custom_provider:9route` | Verified 2026-09-17 from session records |
| Round-1 counters are host-reported | `results/tokens-round-1.json`: our 46 turns / 2,914,030 total / 1,276,014 fresh; tailwind 9 / 169,590 / 41,590; shadcn 16 / 385,904 / 65,520 | Verified 2026-09-17 |
| The Our arm's figure is artifact-inflated | `results/breakdown` series: 12 turns beyond warm-up report no cache read, re-sending a 54–118 k context uncached — 1,056,895 tokens, 86% of that arm's uncached input. tailwind and shadcn each lose the cache only on the shared warm-up turn | Verified 2026-09-17 |
| The Our arm's stylesheet contains no Tailwind utilities | Built `our` CSS contains `@theme default` variables and preflight but no `.justify-between`, `.items-center`, `.rounded-md`, or `.text-sm` rules, while `packages/pro/src` uses utilities in 37 places across 8 files; the arm's `vite.config.ts` registers only `react()` and its `package.json` omits `@tailwindcss/vite` | Verified 2026-09-17 |
| No monetary claim is supported | Every recovered `cost` object is zero (`anyCostNonZero: false` in all three runs) | Verified 2026-09-17 |
| Repository gates | `pnpm workflow:check`, `pnpm docs:check` | Pending — run at the end of this increment |

## Carried forward

1. The owner decision on PRD 0004 Open question 1 (Our-arm frame repair, and whether it invalidates round 1).
2. Authorization for the repeat runs to reach three paired runs per arm, with provider, model, effort, repetition count, and spend ceiling.
3. A decision on whether the three-pair target is sufficient at the observed variance, once the artifact is controlled.
4. The unrelated pre-existing owner items: PRD 0003 scope approval, the unindexed `nd-token-efficiency.md`, and the approved `prd-0001` workflow benchmark whose `BENHMARK.md` target was deleted.

## Resume State

- Updated at / author: 2026-09-17 / Mavis.
- Completed / partial / not started: completed — substrate restore, positive control, specification and briefs, three instruments, the round-1 smoke, independent verification, counter capture, PRD 0004, index row, evidence file. Not started, and unauthorized — the repeat runs.
- Exact next action or command and working directory: none pending execution. The next action is a decision, not a command: PRD 0004 Open question 1. To reproduce round 1, run `node apps/benchmark/scripts/capture-tokens.mjs --manifest apps/benchmark/results/runs.json --out apps/benchmark/results/tokens-round-1.json` from the repository root.
- Current hypothesis / blockers / decision needed: the harness works and the ordering is provisional for two independent reasons — n=1, and the Our arm's cache artifact. Its last-place rank survives the artifact; its magnitude does not. The blocker on the repeats is the frame-repair decision, because repairing the frame changes the round's basis.
- Decisions and rejected approaches with reasons: rejected `ceil(chars/4)` as a headline (self-labels `ESTIMATE`); rejected publishing a single-run percentage; rejected a monetary claim (all `cost` objects zero); rejected quoting `totalTokens` without the fresh figure (cache reads dominate); rejected accepting workers' self-reports as outcome evidence; rejected widening the workload beyond the UI layer (it would bury the strategy signal under a shared constant); rejected one multi-path delete after it corrupted the second path, and one `rm` per file instead; recorded the shadcn arm's two-file deliverable as a finding rather than forcing symmetry, because vendored primitives *are* that strategy.
- Evidence still valid / invalidated and why: round-1 counters remain valid as measurements and are not invalidated by the artifact — the artifact is disclosed and bounded, so the ranking stands while the magnitude does not. If the frame is repaired, round 1 becomes a different experiment and must be superseded rather than pooled.
- Relevant source, docs, and output paths (repo-relative): `apps/benchmark/README.md`, `apps/benchmark/spec/{workload,protocol,brief-our,brief-tailwind,brief-shadcn}.md`, `apps/benchmark/scripts/{capture-tokens,compare,breakdown}.mjs`, `apps/benchmark/results/*`, `docs/prd/0004-agent-token-benchmark.md`, `docs/evidence/token-benchmark-three-ui-strategies.md`.
- Successor ownership transfer / outstanding coordination: none; the owner holds the frame-repair and repeat-authorization decisions, and PRD 0004 carries the follow-on work.

## Verification and closure

- Criterion / command or inspection / result / evidence location: every checked criterion above is verified by a command the orchestrator ran, recorded in `docs/evidence/token-benchmark-three-ui-strategies.md` with its session paths and reproduction commands.
- Tested state and relevant environment for cross-session, high-risk, or release work: Windows host, `pnpm` workspace of 22 projects; the only product changes are the restored `apps/benchmark/**` arms and two additive shared-config lines. No release artifact was produced.
- Combined-state checks and integration result: all three arms build and test green in the same workspace; nothing else was integrated concurrently.
- Current-doc reconciliation result / conflicts resolved: PRD 0004 is indexed and PRD 0003's separate counter-app scope is preserved without overlap; the removed `apps/benchmark.md` conclusions are superseded only for tokens, while its bundle figures are reproduced rather than contradicted.
- Optional durable learning updated, corrected, retired, or no-op: the host-counter mechanics remain in agent memory; the round-specific findings live in the PRD, the evidence file, and this task rather than in standing instructions.
- Failed / skipped / unverified checks and reasons: the repeat runs are skipped by design — not authorized. Repository gates are listed as pending and must pass before this task closes. `model_verdict` is unavailable from the host and is substituted by per-record model evidence.
- Recovery plan / operations reference if relevant: the round is additive under `apps/benchmark/**`; reverting is deleting that directory plus the two additive shared-config lines and this task's doc set. No destructive operation, publish, or release step is part of this scope.
- Implemented / integrated / deployed state and evidence: implemented on the working tree at base `ec942a5`; not yet committed; not integrated; not deployed.
- Status: wip — the authorized increment is complete and verified; closure awaits the gates and the owner's frame-repair decision.
