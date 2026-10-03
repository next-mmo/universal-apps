---
name: kb-workflow-feedback
description: Review recurring workflow friction across related tasks and improve repository guidance. Use for workflow retrospectives or concrete reusable user feedback; do not run a full retrospective at every task completion.
---

# Workflow Feedback

Use [WORKFLOW.md](../../docs/WORKFLOW.md#closeout-learning) as the authority for selective learning, authorization and documentation lifecycle. Keep the review smaller than the work it helps.

## Choose the scope

- **One correction or closeout signal:** apply the closeout learning rules directly. Read only the existing section/skill that owns the lesson; no history scan, new proposal or repeated feedback questionnaire.
- **One slow task or a daily execution audit:** use [kb-audit-workflow-efficiency](../kb-audit-workflow-efficiency/SKILL.md).
- **A requested multi-task retrospective:** use the user's period and project. If unspecified, start with recent relevant task metadata and at most 30 commit subjects; widen only when evidence calls for it. Do not scan unrelated projects or automatically load weeks of history.

## Review evidence

1. Start from the requested outcome and feedback already provided. Ask only when missing context would materially change the recommendation.
2. Inspect the relevant current task summaries, blockers and handoff evidence. For board consistency, reuse the task-triage script; a clean result proves metadata consistency, not runtime correctness or narrative accuracy.
3. Distinguish necessary verification from avoidable repetition. Preserve release, isolation, security and acceptance gates. Prefer the narrowest trustworthy check, not weaker proof.
4. Identify at most three useful changes. Separate observed facts from inferred causes; quote timing or token savings only when measured.

## Apply or propose

- Existing explicit approval and the bounded standing authorization in WORKFLOW.md apply; do not ask again for the same authorized change.
- Update the narrowest existing guidance in place. Reuse the task record and git diff as evidence; no separate proposal or product-changelog entry for an already authorized routine workflow improvement.
- For an unapproved material policy change, first make it concrete and reviewable. Use the existing task/handoff, or one proposal under [proposals/](../../docs/proposals/README.md) if it needs an independent decision. Search for a matching proposal before creating one. Preserve all existing gates while approval is pending.
- Keep context-specific exceptions scoped. Do not generalize a single preference to unrelated tasks, automatically edit global settings, or change another session's task ownership.

## Verify and report

Check changed links, Markdown diff and skill metadata; run task drift only when task/board records change. No product builds for documentation edits. State what improved, what evidence supports it, and any remaining uncertainty. With no actionable finding, say so for an explicit review; a routine closeout stays silent.
