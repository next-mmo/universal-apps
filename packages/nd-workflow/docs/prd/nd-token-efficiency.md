---
id: nd-token-efficiency
title: Reuse-first ND token efficiency
status: draft
version: 1
last-audit: 2026-09-16
---

# Change Proposal: Reduce tokens per correctly completed task

## Problem and scope

ND bounds retrieval and verification output, but its monorepo delivery instructions do not explicitly describe how to choose the simplest sufficient implementation. This proposal adds compact decision guidance and a controlled evaluation plan, without adopting another always-on plugin.

- Users: agents and maintainers delivering changes through ND in this monorepo and its retained standalone workflow package.
- Outcome: reduce unnecessary implementation and investigation while preserving functional acceptance, architecture, security, and verification requirements.
- In scope: reuse-first selection, bounded root-cause investigation, simplification inside existing review, and equal-quality measurement.
- Non-goals: installing Ponytail, new mandatory agents, new dependencies, automatic prompt injection, token compression, relaxing checks, refactoring unrelated code, or fixing the separately reported context-index classification issue.
- Location exception: the user explicitly approved these two planning artifacts under root `docs/`. This is not a repository-wide documentation migration. Existing discovery uses `.agents/docs/`; consumers must use these exact draft paths until an approved routing decision exists.
- Open execution inputs: benchmark model/provider, effort, authorized spend, and host token-counter availability. These do not block this draft; they must be resolved before benchmark execution.

## Approval record

- Scope approval: pending for version 1, requirements NTE-01 through NTE-05.
- Approver / date: not yet recorded for the completed draft.
- Drafting authorization: user selected “Approve drafting these two documents in docs/” on 2026-09-16, questionnaire `ask_ec183fd50895630429795ff7`.
- Execution authorization: not authorized. Drafting approval is not approval of the resulting requirements or permission to implement or run benchmarks.
- Material changes require a new version and renewed scope approval.

## Canonical targets and baseline

Baseline: `e91f453b672ba3fe33b3a98b88d885f5277b60e4`.

- [Root instructions](../../AGENTS.md), Engineering judgment and ND Workflow: retain short routing guidance.
- [Delivery workflow](../../.agents/docs/WORKFLOW.md), Execution: proposed monorepo owner of implementation-selection and review behavior.
- [Standalone workflow instructions](../../packages/nd-workflow/AGENTS.md): reconcile equivalent guidance through the package's owning source and existing distribution process; locate generated copies before editing, never patch generated output first.
- [Evaluation guidance](../../agent/evals.md): proposed owner of the paired efficiency protocol.
- [Earlier reuse-first suggestion](../suggestions/0001-reuse-first-token-efficiency.md): historical rationale only, not authority for current behavior.
- NTE requirement IDs are new; no existing stable requirement IDs are replaced.
- Integration owner: Mavis coordinating one executor. Recheck concurrent changes before implementation; no ownership of other active tasks is assumed.

## Requirement changes

### ADDED

**NTE-01 — Simplest sufficient implementation.** Understand the affected flow and acceptance criteria before editing. Prefer an existing repository capability, then a suitable standard-library or platform feature, then an installed dependency, before new code. This is a decision order, not a requirement to force an unsuitable option. Preserve security, accessibility, maintainability, and framework/runtime contracts. Record only material rejected alternatives in the existing task.

Scenario: given an existing component that satisfies the requested platforms, the agent reuses it rather than adding a duplicate. Given a native feature that breaks required parity, the agent rejects it and uses the smallest compliant alternative.

**NTE-02 — Bounded root-cause investigation.** Trace the failing path and affected shared callers; fix the owning boundary when justified. Expand reads or searches for a named unresolved question or impact check. Do not impose full-repository exploration, fixed tool-call limits, or a ban on necessary re-reading after changes.

Scenario: a shared helper causes two callers to fail; investigation covers both callers and the repair includes regression coverage. An isolated bug does not trigger unrelated architecture exploration.

**NTE-03 — Simplification within existing review.** Existing review checks for duplicate capability, unnecessary abstraction/dependency, and out-of-scope behavior. Simplification must preserve approved behavior and required checks. No mandatory extra agent, checklist file, or “fewest lines/files” target is introduced.

Scenario: a redundant wrapper may be removed, but a required validation boundary or cross-platform adapter remains even if longer. A simplification that changes approved scope pauses for renewed approval.

**NTE-04 — One owner per instruction.** Put detailed monorepo behavior in the delivery workflow and link from standing instructions. Preserve standalone package usability through its canonical source and distribution mechanism. Do not inject the full policy into every tool call or subagent by default. Measure instruction-size delta without increasing existing budgets merely to fit duplicated prose.

Scenario: root instructions route to the rule owner; an installed standalone workflow still supplies equivalent guidance without requiring monorepo-only files.

**NTE-05 — Equal-quality efficiency evidence.** Compare current ND with ND plus NTE-01 through NTE-04 using the same baseline, tasks, model, effort, permissions, dependencies, and predeclared acceptance checks. Use fresh isolated sessions and verify loaded instructions to prevent treatment contamination. Record actual input/output tokens, cache accounting where available, cost, elapsed time, retries, and task success. Count failed attempts rather than reporting only successful cheap runs. Report per-task and aggregate outcomes; lines changed are diagnostic only.

Proposed pilot: four task categories (reuse feature, shared-helper bug, cross-platform component change, focused documentation change), three paired repetitions per category: 24 total runs. Alternate arm order. User approval of provider and spend is required before execution. Functional tasks run their required tests; UI tasks include representative rendering/interaction checks, not only compilation. Report actual measured tokenizer/host usage; if unavailable, label byte/character proxies and make no billed-token or cost-saving claim.

Adoption gate: no acceptance or safety regression in the pilot, and lower aggregate measured tokens at equal completed-task count. Mixed or model-specific results remain explicit; the pilot is not statistical proof or a universal percentage claim. If quality drops, fix or reject the policy regardless of savings.

## Design impact and decisions

No product runtime or public API change is proposed. Guidance changes affect agent behavior and therefore require medium-risk review and behavioral evidence. Ponytail is inspiration, not an installed dependency or a source of validated ND savings.

Sources: [Ponytail rules](https://github.com/DietrichGebert/ponytail/blob/main/AGENTS.md), [upstream benchmark](https://github.com/DietrichGebert/ponytail/blob/main/benchmarks/results/2026-06-18-agentic.md). Upstream results were inspected during discovery but not reproduced; they do not establish ND's incremental benefit.

## Acceptance and delivery

- [ ] NTE-01–03: inspect final policy and representative positive/negative scenarios; no weakened acceptance or safety checks.
- [ ] NTE-04: verify owning sources, links, standalone distribution parity, and existing documentation/workflow budgets.
- [ ] NTE-05: approve protocol and execution inputs before runs; publish exact tested revisions, raw metric references, acceptance results, failures and limitations.
- [ ] Reconcile canonical files against the baseline and current concurrent changes before integration; resolve conflicts rather than overwriting another owner's edits.
- Risk: medium for proposed shared-workflow behavior; this delivery is specification-only.
- Recovery: revert only this increment's policy changes if quality or efficiency regresses; retain honest evaluation evidence. No destructive operations or deployment are included.
- Implementation gate: explicit version-specific scope approval plus implementation authorization.
- Integration gate: affected documentation/workflow checks and acceptance review; benchmark conclusions require authorized measurements.
- Deployment/release: not authorized; do not label the proposal shipped without separate release evidence.
