# Suggestion 0001: Reuse-first token efficiency

> **Status:** applied  
> **Created:** 2026-09-05  
> **Proposed by:** User and agent  
> **Decision owner:** Human  
> **Canonical target:** root agent judgment, Scrum delivery/context/verification references, and agent efficiency evaluation

## Observation and Evidence

- Facts: the repository already provides bounded context, catalog discovery, and an [efficiency baseline](../../../agent/evals.md). Baseline workflow and documentation checks pass; root instructions estimate 690 tokens and the Scrum entry point 872.
- Inspiration: [Ponytail](https://github.com/DietrichGebert/ponytail) emphasizes understanding the flow and reusing capabilities before adding code. The user's linked fork could not be retrieved; no fork-specific behavior is asserted.
- Inference: fewer redundant reads, unnecessary changes, and repeated explanations may reduce task tokens. No behavioral savings have been measured.
- Owning increment: [Scrum adoption task](../tasks/done/done-0001-adopt-agent-workflow-scrum.md).

## Approved Workflow Change

- In [root judgment](../../../AGENTS.md), route to the delivery sequence: understand the flow, confirm necessity, reuse repository capabilities, consider standard/platform features and installed dependencies, then implement the smallest maintainable solution.
- In context routing, expand reads for a named uncertainty and reuse available evidence unless changed or freshness is required.
- In verification, avoid repeating successful checks without a reason; retain meaningful regression and negative-path coverage.
- The Agent Workflow Scrum skills were retired 2026-09-15 in favor of ND Workflow; their reference links were removed with them.
- Keep reports concise and facts in their existing owners. Extend [evaluation guidance](../../../agent/evals.md) with comparable reuse, defect, and security scenarios.

## Expected Benefit, Scope, and Risks

Applies to repository workflow only. Preserve approvals, workspace boundaries, shared component/accessibility/platform contracts, security, validation, data-loss handling, and required checks. Shorter output must not hide uncertainty or omit requirements. No product, CLI/context implementation, plugin, hook, dependency, or personal configuration changes.

## Validation

- Run workflow, documentation, and existing adapter checks; separate baseline failures from regressions.
- Target no net growth in affected standing instructions and skill entry points; report normalized characters/4 estimates separately from measured host tokens.
- Use the evaluation scenarios for later paired agent runs. Do not claim behavioral savings from documentation checks.

## Human Decision

- **Decision:** accepted
- **Decided by:** User
- **Date:** 2026-09-05
- **Rationale:** User explicitly requested implementation of the complete proposed plan in this conversation.

## Application Evidence

Implementation and validation are tracked in the [completed task](../tasks/done/done-0001-adopt-agent-workflow-scrum.md).

- Changed canonical files: `AGENTS.md`, the Scrum delivery/context/verification references, and `agent/evals.md`.
- Synchronized ignored existing adapters with `.agents/scripts/skill.sh init claude cursor`.
- Verification: `pnpm workflow:check --strict-budget`, `pnpm docs:check`, `bash .agents/scripts/skill.sh check all`, `pnpm agent check --changed`, `pnpm agent:docs:check`, and `git diff --check` passed.
- Normalized estimates: `AGENTS.md` decreased from ~690 to ~673 tokens; `.agents/skills/agent-workflow-scrum/SKILL.md` stayed at ~872 tokens. Behavioral token savings remain unmeasured until paired agent runs.
