---
id: "0004"
title: "Agent-token benchmark: three UI strategies"
status: approved
last-audit: 2026-09-17
---

# Change Proposal: Measure host-reported agent tokens for one matched todo app built three ways

Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- User / problem / desired outcome: consumers of this repository choose between three ways to build a screen — compose the shared `@package/pro` block, hand-write markup with Tailwind utilities, or vendor local shadcn-style primitives. They ask which one costs the *agent* fewer tokens to build. The prior `apps/benchmark` round answered only in estimated source tokens (`ceil(chars/4)`) and recorded the billed-token outcome as unmeasurable, and repository policy forbids savings claims backed only by character heuristics. Desired outcome: a repeatable round that measures each strategy with host-reported token counters, so the answer rests on real usage rather than on transcript size.
- In scope: one frozen workload specification shared by all three arms; three matched arms differing only in UI strategy; fresh isolated sessions per run on a pinned model and reasoning effort; capture of host per-turn usage from the session records; a compare table that always pairs the cache-dominated total with the fresh figure; independent verification of each arm's outcome by the orchestrator, not by the arm's own report; explicit disclosure of any measurement artifact that would otherwise be read as strategy cost.
- Non-goals: claiming monetary savings (every observed `cost` object is zero); publishing a percentage from a single run; changing the reuse-first policy in [`nd-token-efficiency.md`](../../packages/nd-workflow/docs/prd/nd-token-efficiency.md); measuring the counter-app scenario, which belongs to [`0003-counter-app-token-measurement.md`](0003-counter-app-token-measurement.md); restoring the removed `apps/benchmark.md` report or its claims; Tauri/Rust or release-artifact measurement.
- Selected requirements / open questions (clarification is not approval): ATB-01–ATB-06 below. Owner-locked parameters, recorded 2026-09-17 (questionnaire `ask_1b2f39cd28ecc269f3480c65`): three-strategy scope; smoke first and report before scaling; model pinned to `custom_provider:9route/ocg/deepseek-v4.1-flash` with reasoning effort off; target of three paired runs per arm reported as median with range. Still open — (a) is the target repetition count sufficient at the observed variance, given that round 1 is n=1? (b) must the Our-arm frame be repaired before the repeat runs, and does the repair invalidate round 1? See Open questions.
- Enabling fact, re-verified 2026-09-17: the host persists per-turn provider usage in `<activeDataDir>/v2/sessions/YYYY/MM/DD/<HH-MM-SS>-<session_id>/messages.jsonl`, one record per assistant turn, with `total = input + cacheRead + output`. Round 1 also re-verified the model pin from the records themselves — every captured turn in all three arms reports `model: ocg/deepseek-v4.1-flash` and `provider: custom_provider:9route` — which matters because the host reported `model_verdict: missing` for each delegated run.

## Approval record

- Scope approval: approved 2026-09-17 by the repository owner. The owner approved the three-strategy scope in `ask_1b2f39cd28ecc269f3480c65` and then approved both the build of this round and its three-session smoke in `ask_bfd3c9a7b2bb9dff821a4632`, together with selective git tracking and a UI-layer-only workload shape ("your best" was resolved to UI-layer-only).
- Approver / decision date: repository owner, 2026-09-17.
- Exact approved requirement IDs, exclusions and document revision or content hash: ATB-01 through ATB-06, as written in this revision. Excluded from approval: scaling to three paired runs per arm, which the owner deferred to a report-then-decide step, and any publication outside the repository.
- Approval evidence: questionnaires `ask_1b2f39cd28ecc269f3480c65` and `ask_bfd3c9a7b2bb9dff821a4632`; the executed smoke summarized in [`docs/evidence/token-benchmark-three-ui-strategies.md`](../evidence/token-benchmark-three-ui-strategies.md).
- Execution authorization: granted for the round-1 smoke only — three sessions, one run per arm. The repeat runs to reach three pairs per arm are **not** authorized until the round-1 report is reviewed. Every run consumes paid model tokens.
- Scope changes since approval / renewed decision needed: none. A decision is needed on Open question (b) before the repeat runs, because repairing the Our-arm frame would make its later numbers incomparable with round 1.

## Canonical targets and baseline

- Policy owner: [`nd-token-efficiency.md`](../../packages/nd-workflow/docs/prd/nd-token-efficiency.md) NTE-05 (draft, unapproved) defines the equal-quality paired-efficiency protocol. This PRD supplies a concrete three-arm scenario and the capture instrument; it must not contradict NTE-05.
- Measurement guidance owner: [`agent/evals.md`](../../agent/evals.md) — recording fields, and the required separation of host usage from heuristic text size.
- Sibling scenario: [`0003-counter-app-token-measurement.md`](0003-counter-app-token-measurement.md) covers the counter-app question with its own arm definition. This PRD does not answer that question and claims no counter-app result.
- Prior art (history, not current behavior): `apps/benchmark.md` and `apps/benchmark/**` as of `e91f453`, removed at `23723ab`. Its estimated-source-token ordering was Our < Tailwind < shadcn, while its production bundle ordering was the reverse; it recorded the billed-token winner as "Not measurable in this run". Round 1 supersedes its token conclusion and reproduces its bundle figures.
- Recovered comparison pair, published earlier with no new spend: the 2026-09-15 Alert run yielded ND 483,386 versus baseline 775,589 total tokens (−37.7%), with fresh input+output 85,306 versus 96,037 (−11.2%). That is a two-arm pair on a different task; it corroborates the protocol but is not part of this round.
- Source baseline revision: `ec942a5`, the HEAD from which the round was built.
- New capability: yes. No three-arm host-counter measurement exists at the baseline.
- Integration owner: Mavis. Round artifacts live in `apps/benchmark/**`; the board task is `docs/tasks/blocked-0006-agent-token-benchmark-round-1.md`. The index row for this proposal was added together with it.

## Requirement changes

### ADDED

**ATB-01 — Matched three-arm workload.** Freeze one workload specification before any arm runs, and give every arm the same requirements and the same acceptance commands. The three arms differ only in UI strategy: compose the shared `@package/pro` CRUD block; hand-write markup with Tailwind utilities; vendor local shadcn-style primitives. Each arm starts from a byte-identical pre-installed substrate, so the measured difference is the strategy rather than a shared constant. An arm may legitimately write more than one file when vendored primitives *are* the strategy; that asymmetry is recorded as a finding, not corrected.
Scenario: given three fresh sessions briefed with the frozen specification, the arms differ only in the strategy section of the brief, and each arm's produced source is readable at a recorded path.

**ATB-02 — Host-reported counters, not character heuristics.** Derive every reported figure from the host's per-turn usage records, and never present `ceil(chars/4)` or any transcript-byte proxy as the headline. Record, per run: total tokens, uncached input, output, cache reads, turns, and the session directory the figures came from.
Scenario: given a captured run, each reported number can be recomputed from the cited `messages.jsonl` by summing its usage records.

**ATB-03 — Smoke before scale.** Execute one run per arm first and report before authorizing the repeats. Report the target repetition count with median and range only once the repeats exist; never present a single run as a stable percentage.
Scenario: given an n=1 round, the compare output states the provisional status of the ordering in its limits section rather than in a footnote.

**ATB-04 — Artifact accounting.** Record provider-cache anomalies alongside the totals, and treat a run's magnitude as provisional when they are present. A turn after the first that reports no cache read re-sent the whole context uncached; that is a caching effect, not code the arm wrote, and it inflates both the fresh and total figures. The one expected warm-up turn every arm shares is excluded from the artifact measure.
Scenario: given a round where one arm lost its cache, the compare output names that arm, the token volume involved, and that its rank survives while its magnitude does not, without a manual side-analysis.

**ATB-05 — Equality of outcome is verified independently.** Accept an arm's result only after the orchestrator itself runs the arm's acceptance commands; a worker's self-report is evidence of what it attempted, not proof of outcome. Count repair turns and failed acceptance runs as part of the arm's cost rather than excluding them, and record when an arm required none.
Scenario: given three arms reporting success, the round record cites commands the orchestrator ran, not the arms' own summaries.

**ATB-06 — Reporting limits travel with the numbers.** Always quote the fresh `input + output` figure beside `totalTokens`, because cache reads dominate the total. Make no monetary claim while every recovered `cost` object is zero. Disclose frame defects and arm asymmetries as validity threats in the same document as the result, so no reader can take a ranking without them.
Scenario: given any published table from this round, a reader can see what the numbers do not support without consulting a second document.

## Open questions

1. **Is the Our-arm frame defective, and does repairing it invalidate round 1?** The Our arm's `vite.config.ts` registers only `@vitejs/plugin-react`, and its `package.json` does not depend on `@tailwindcss/vite`, yet `packages/pro/src` styles itself with Tailwind utility classes in 37 places across 8 files. The built stylesheet therefore contains Tailwind's raw `@theme default` variables and preflight but no utility rules at all. The defect is inherited — the old round's identical 39.47 kB stylesheet shows it predates this work — and it means the Our arm was never visually comparable to the other two. Repair is a one-line plugin registration plus a dependency, but it changes the frame, so it must be decided before the repeat runs.
2. **Is three paired runs per arm sufficient** at the observed spread? Round 1's Our arm is an extreme outlier for a reason (ATB-04) rather than through ordinary variance, so the observed spread is not yet a useful variance estimate.
3. **Which strategy the round is really measuring.** ATB-01 isolates the UI layer, which is the strategy signal, but it excludes the substrate cost the consumer also pays. Whether a later round should measure whole-app assembly is unresolved.

## Round 1 result (approved smoke)

Executed 2026-09-17 as the authorized smoke: three fresh sequential `worker` sessions, one per arm, all on `custom_provider:9route/ocg/deepseek-v4.1-flash` with reasoning effort off, each given the frozen specification and its own brief.

| Arm | Turns | fresh input+output | totalTokens | cache reads |
| :-- | --: | --: | --: | --: |
| our | 46 | 1,276,014 | 2,914,030 | 1,638,016 |
| tailwind | 9 | 41,590 | 169,590 | 128,000 |
| shadcn | 16 | 65,520 | 385,904 | 320,384 |

All three arms passed both acceptance commands on their first attempt with no repair turns, verified independently by the orchestrator. The ordering is therefore provisional on two counts, not one: n=1, and the Our arm carries a provider-cache artifact in which 12 turns beyond the expected warm-up re-sent the whole context uncached, accounting for 1,056,895 tokens (86% of its uncached input). Its last-place rank survives that artifact; its magnitude does not. Full detail, session paths, and reproduction commands are in [`docs/evidence/token-benchmark-three-ui-strategies.md`](../evidence/token-benchmark-three-ui-strategies.md).
