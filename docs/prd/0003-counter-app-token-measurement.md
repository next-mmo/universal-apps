---
id: "0003"
title: "Counter-app token savings measurement"
status: draft
last-audit: 2026-09-17
---

# Change Proposal: Measure real token usage for the same counter app built with and without the stack

Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- User / problem / desired outcome: the owner wants a defensible answer to "how many tokens does building the same counter app save with our stack?" No such number exists today. The only prior matched benchmark recorded the billed-token outcome as unmeasurable, and repository policy forbids unmeasured savings claims (`.agent/app-foundation.md:91`: budgets are "proxies, not billed model-token savings"; `docs/evidence/token-efficient-foundation.md:62`: "Source/response budgets are not billing evidence"). Desired outcome: a reproducible paired measurement that yields host-reported token counts per arm.
- In scope: one frozen counter-app specification; two arms (stack-assisted vs baseline from scratch); fresh isolated sessions; capture of host per-turn usage; repetition; honest reporting of failed and discarded attempts; React first, other frameworks only as a gated extension.
- Non-goals: changing the reuse-first behavior policy (NTE-01–NTE-04); publishing marketing percentages; prompt compression; claiming monetary savings without provider pricing evidence; Tauri/Rust packaging measurement; altering release or publish state; restoring the removed `apps/benchmark/**` fixtures.
- Selected requirements / open questions (clarification is not approval): CTM-01–CTM-06 below. Resolved by the owner on 2026-09-17 (recorded, not scope approval): (a) the baseline arm is a plain `npm create vite` scaffold with repository guidance withheld, chosen to isolate stack assistance. Still open — (b) is a 3-pair minimum sufficient at the observed per-run variance? (c) which framework follows React, and is it required for the first result?
- Enabling fact, verified 2026-09-17: the host persists per-turn provider usage in each session's `messages.jsonl`. Two record shapes were observed and both validate arithmetically (`total = input + cacheRead + output`): `usage: { input, output, cacheRead, cacheWrite, totalTokens, cost{…} }` in the 2026-09-15-era records (63 of 184 session directories carry a `messages.jsonl`), and flat `input_tokens`, `output_tokens`, `cache_read`, `total_tokens`, `context_window`, `request_duration_ms` in the 2026-09-17-era records. This is precisely the counter the 2026-09-14 run reported as unavailable, so a real measurement is now obtainable. Availability and shape must still be re-verified at execution start per CTM-03.

## Approval record

- Scope approval: pending (draft).
- Approver / decision date: not recorded.
- Exact approved requirement IDs, exclusions and document revision or content hash: none yet; no requirement below is approved.
- Approval evidence: none for these requirements. This draft was produced by an explicit `/nd-spec-feature` specification-only request, which authorizes discovery and drafting only. Separately, on 2026-09-17 the owner authorized publishing the recovered counters into `docs/evidence/coding-round-alert-nd-vs-baseline.md`, and recorded the baseline-arm choice above (questionnaire `ask_3d1bc0f842cbba073e9c3a65`). Neither action approves CTM-01–CTM-06.
- Execution authorization: **not authorized.** Running either arm consumes paid model tokens and requires separate explicit approval of provider, model, reasoning effort, and spend ceiling. The owner declined the counter-app run on 2026-09-17, choosing the no-spend counter recovery instead. Drafting approval would not be execution approval.
- Scope changes since approval / renewed decision needed: not applicable while status is draft.

## Canonical targets and baseline

- Policy owner: [`nd-token-efficiency.md`](../../packages/nd-workflow/docs/prd/nd-token-efficiency.md) NTE-05 (draft, unapproved) defines the equal-quality paired-efficiency protocol. This PRD supplies the concrete counter-app scenario and the counter-capture instrument. It must not contradict NTE-05; if NTE-05 is approved first, CTM-01–CTM-06 fold into that pilot instead of competing with it.
- Measurement guidance owner: [`agent/evals.md`](../../agent/evals.md) — recording fields, and the required separation of host usage from heuristic text size.
- Prior art (history, not current behavior): `apps/benchmark.md` and `apps/benchmark/**` as of `e91f453`, removed at `23723ab`. That matched todo-app run reported `Our` at ~1,423 estimated source tokens versus ~2,242 (plain Tailwind) and ~2,478 (shadcn-style), but a **larger** production bundle (496.78 kB vs 199.62 kB), and recorded the billed-token winner as "Not measurable in this run".
- Recovered counters, published 2026-09-17 with no new spend: the 2026-09-15 paired Alert run recorded host counters as unavailable, but its two sessions still carry valid `usage` records. Summing all 16 ND-arm turns and all 20 baseline turns gives 483,386 versus 775,589 total tokens (−37.7%), of which fresh non-cached input+output is 85,306 versus 96,037 (−11.2%) and output is 11,377 versus 16,297 (−30.2%). [`coding-round-alert-nd-vs-baseline.md`](../../packages/nd-workflow/docs/evidence/coding-round-alert-nd-vs-baseline.md) now carries these counters with their session paths. This is a real measured pair at n=1 on a different task; it corroborates the transcript-byte proxy (−37%) but does not answer the counter-app question, and its `cost` objects are zero so it supports no monetary claim.
- Source baseline revision: `23723ab6b340e992945f5b6e2cb816c50fcd87cc`.
- New capability: yes. No counter-app measurement exists at the baseline; explicitly no baseline result is claimed.
- Integration owner: Mavis. The active board (`docs/tasks/`) contained only `README.md` at drafting time, so no ownership conflict exists. Shared doc `docs/prd/0000-prd-index.md` lists this proposal as **0003** (draft); the row was added together with this checkpoint. The sibling draft `nd-token-efficiency.md` remains unindexed — pre-existing, and an owner decision.

## Requirement changes

### ADDED

**CTM-01 — Matched counter-app scenario.** Freeze one counter-app specification before either arm runs: a counter with increment, decrement, reset, a persisted value, and one validation rule, requiring a production build plus a deterministic domain test. Arm A builds it with stack assistance (starter scaffold plus catalog/`locate` discovery). Arm B builds the identical specification from a plain scaffold with repository guidance withheld — the arm definition the owner fixed on 2026-09-17. Both arms start from the same revision, the same specification text, the same model, effort, permissions, and tool set.
Scenario: given two fresh sessions with the frozen specification, the arms differ only in stack assistance, and the difference is recorded with the exact prompt used.

**CTM-02 — Equal acceptance, failures counted.** Both arms must satisfy the identical predeclared acceptance checks: production build passes and the domain test asserts the validation and reset behavior. A run that fails acceptance, stalls, or needs manual repair is reported as a failed run with its real token cost, never replaced or omitted.
Scenario: given an arm that burns tokens without passing acceptance, the report shows the failed attempt and the totals include it.

**CTM-03 — Real counter capture, no proxy substitution.** Per arm, sum the host-reported per-turn usage from that session's `messages.jsonl`, alongside request count and elapsed time. Both observed record shapes must be accepted: nested `usage.input`/`usage.output`/`usage.cacheRead`/`usage.cacheWrite`/`usage.totalTokens`, and flat `input_tokens`/`output_tokens`/`cache_read`/`total_tokens`. Report `total_tokens` as the headline, and always report the fresh non-cached `input + output` subtotal beside it, because cache reads dominate the total and are priced differently. Character-count/4 estimates and transcript bytes may appear only as clearly labelled secondary proxies and never as the headline result. If counters are absent for a run, that run is reported `UNMEASURED`; proxies are not substituted for it.
Scenario: given a completed arm, the evidence file cites the session paths and the summed values; given a missing counter, the result is `UNMEASURED` and the acceptance section states why.

**CTM-04 — Repetition, alternating order, reported spread.** Run at least three paired repetitions, alternating which arm runs first, and report median and range per arm plus the paired deltas. Report tool calls, files opened before first edit, and retries as diagnostics only, never as the savings result.
Scenario: given three pairs, the report shows per-pair values, the median delta, and the observed range instead of a single percentage.

**CTM-05 — Gated framework extension.** Vue, Svelte, or native arms are added only after the React pair is measured, and a second-resource increment (adding a second counter or a history list to an already-passing app) is measured separately from initial generation so reuse is not confounded with first-build cost.
Scenario: given a completed React result, extension runs report incremental tokens against the existing app rather than restating initial generation.

**CTM-06 — No monetary claim without pricing evidence.** Results are reported in tokens. A cost or "money saved" statement may be published only with provider-reported pricing evidence for the exact model used and the stated token mix; otherwise the report states explicitly that currency cost is unmeasured.
Scenario: given tokens but no pricing evidence, the summary reports tokens and records monetary savings as unmeasured.

## Design impact and decisions

- Components, data ownership, contracts, and trust boundaries touched: `docs/prd/` (this proposal), `docs/tasks/` (checkpoint), `docs/evidence/` (new result file), and optionally a small measurement script that only reads session `messages.jsonl` files. No product runtime, public API, package, or publish surface changes.
- Selected approach: measure with host-persisted per-turn usage rather than transcript bytes, because the counter now exists and it is the only figure that supports a real usage claim.
- Rejected alternatives: (a) char/4 estimates as the headline number — already available, explicitly not billing evidence; (b) restoring the removed `apps/benchmark/**` fixtures — would reintroduce three workspace packages and lockfile importers for a measurement that their own report concluded was unmeasurable; (c) single-run claims — the prior attempt already produced a direction-only result at n=1.
- Consequence: any result is model-, provider-, and revision-specific, and must be published with the exact model identifier and revision; the stack's bundle-size disadvantage recorded in the prior art remains a real trade-off and is out of scope here.
- Decision record: none warranted yet; record one if the arm definition changes after approval.

## Acceptance and delivery

- [ ] CTM-01/CTM-03: inspect the frozen specification, both session records, and the summed counters; confirm the arms differ only in stack assistance and that no proxy is presented as usage.
- [ ] CTM-02/CTM-04: the acceptance checks are shown as run per arm, failures are present in the totals, and the report shows per-pair values with median and range.
- [ ] CTM-05/CTM-06: extension runs, if any, report increments; the summary contains no monetary claim without pricing evidence.
- [ ] Reconcile `docs/prd/0000-prd-index.md` (add the row) and confirm this proposal does not contradict NTE-05; resolve conflicts rather than overwriting another owner's text.
- Risk: medium — behavioral evidence that can be misread as a product guarantee. Required approvals: scope approval for this PRD, plus separate execution authorization with a spend ceiling.
- Recovery: delete the evidence file and checkpoint; no destructive operation, no publish, no release step is included. Reverting this PRD affects no runtime behavior.
- Implementation gate: not authorized. Execution gate: separate explicit request naming provider, model, effort, repetition count, and spend ceiling. Integration gate: the acceptance checklist above plus the evidence file. Deployment/release: not applicable; do not describe results as a shipped capability.
