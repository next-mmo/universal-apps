---
name: kb-audit-workflow-efficiency
description: Audit recent execution with a required checklist covering token usage, budget signals, context/tool waste, decision quality, and verification. Use for a single-run or daily efficiency audit, or after a clearly slow or rework-heavy run. Complements broader kb-workflow-feedback retrospectives.
---

# Audit Workflow Efficiency

Audit the assistant's own execution and recommend practical improvements that make future work faster and more reliable. Use this for a specific task or a daily review when the user asks, or when a run shows clear repeated retries or substantial avoidable rework. Do not add a retrospective to every routine task.

For planning or recovering the current execution, use [kb-anti-token-burner](../kb-anti-token-burner/SKILL.md). This skill reviews recorded work; do not automatically run both. Route uncertain consequential premises through the [workflow safeguards](../../docs/WORKFLOW.md#decision-and-token-safeguards).

## Scope

- Review only the task or time period the user identifies. For "today," use the available current-day task history in the relevant project; if that history is unavailable, limit the review to the current conversation and say so.
- Start from the user's requested outcome, then examine only the execution evidence needed to explain what helped or slowed it down: task messages, tool calls, command results, waits, edits, and verification.
- Do not scan unrelated repositories, old tasks, or broad project history to find hypothetical friction.
- If the user asks for a daily review, group repeated patterns across that day's work. Do not create a persistent log unless asked.

## Required checklist for every audit

Evaluate every item whenever this skill is invoked, using evidence from the requested scope. This does not require an audit on every task or loading both safeguard skills automatically. Mark each item **OK**, **Finding**, **Unavailable**, or **N/A**, with a short evidence note. Missing evidence is Unavailable, not OK; use N/A only when the item does not apply.

- [ ] **Scope and outcome:** Did execution address the requested outcome in the correct project/environment, without unnecessary work or unsupported completion claims?
- [ ] **Token visibility:** Classify usage as measured, proxy, or unavailable. Give the source and scope of any figure; distinguish task totals from partial tool-output estimates. Do not substitute account limits, context capacity, or tool-wrapper savings for consumption, or double-count cumulative counters.
- [ ] **Budget and growth:** Was a budget or comparable baseline supplied, and did available evidence show unusually costly execution? Review recorded checkpoints and any applicable warning/limit response using the token-checkpoint rules below. With no budget, state that; still inspect avoidable growth using proxies. Do not invent a token threshold, historical baseline, or missed alert when measurement was unavailable.
- [ ] **Context waste:** Check repeated reads, broad searches, oversized/truncated output, unnecessary skill loading, and duplicate plans or recaps. Identify the specific avoidable work rather than guessing its token cost.
- [ ] **Execution waste:** Check unchanged retries, tool/environment failures, polling, duplicate services, unnecessary builds/tests, and useful batching or reuse that was missed. Distinguish necessary runtime from avoidable agent work.
- [ ] **Decision quality:** Check unsupported assumptions, automatic agreement, stale context, resulting rework, and unnecessary confirmation loops. Assess whether evidenced consequential risks were raised when discovered, including during implementation, while existing approvals remained valid.
- [ ] **Verification and stopping:** Were required checks sufficient and actually run, and did work stop once the outcome was supported? Identify both missing proof and redundant checks. Keep this audit bounded too; do not run new product tests merely to assess recorded execution.

Distinguish useful verification from avoidable work. Never recommend skipping a check that is needed to establish correctness or release safety just to reduce time. Instead, suggest the narrowest trustworthy check for the requested change.

## Evidence and Metrics

- Prefer task history and recorded tool outputs when available; use the conversation itself when logs are unavailable.
- Reuse any [token checkpoints](../kb-anti-token-burner/SKILL.md#token-checkpoints-during-work) recorded during execution. Preserve their measured/proxy/unavailable labels; do not reconstruct task totals from partial tool output or account-wide limits.
- Report measured elapsed time, command or tool counts, and token figures only when the source exposes them. Label estimates clearly and do not invent precision.
- Separate observed facts from likely causes. If a delay could be tool startup, compilation, or an external wait and the records do not distinguish them, state that uncertainty.
- Explain what the work accomplished as well as what caused friction; an expensive check may still have prevented a bug.

## Audit Output

Include a compact checklist result for all seven items, followed by explanations only for material findings or evidence gaps. The token item must explicitly say measured, proxy, or unavailable on every audit. Reuse the checklist's evidence rather than repeating it in a second recap. Cover:

1. The requested outcome and whether it was achieved.
2. The strongest evidence about time, token, tool-use, or rework cost.
3. The main cause, distinguishing necessary work from avoidable work.
4. One to three concrete changes for the next similar task, with expected benefit stated only as specifically as the evidence supports.
5. Whether the finding appears local to this run or suggests a durable workflow rule.

If no meaningful inefficiency or bug risk is supported by the evidence, say so instead of manufacturing recommendations.

## Durable Changes

An explicit audit normally recommends changes. Apply an implementation request or the bounded standing authorization in [WORKFLOW.md](../../docs/WORKFLOW.md#closeout-learning) when applicable; do not ask again for already authorized narrow corrections. Keep changes tied to evidence, preserve safety and verification requirements, and verify the documentation diff. Material policy changes outside that authorization remain proposals.

Routine task closeout uses the brief signal check in WORKFLOW.md, not this full audit. With no reusable correction or evidenced friction, create no learning entry or report.

Use `.agents/skills/kb-workflow-feedback/SKILL.md` for a broader multi-task or multi-week retrospective about systemic workflow changes; do not repeat that retrospective for a single-run audit.
