# Risk-Scaled Delivery

## Reuse Before Implementation

Understand the affected code and trace its real flow before choosing a solution:

1. Confirm each proposed change serves the approved outcome; omit speculative additions without dropping requirements.
2. Discover and reuse repository capabilities through the catalog and recipes.
3. Consider standard library or native platform features, then installed dependencies, when existing repository capabilities are insufficient.
4. Implement the smallest maintainable solution that meets the contract; avoid unrelated cleanup and abstractions without a current need.

Preserve shared component, accessibility, cross-platform, security, validation, and data-loss handling contracts. Fewer lines alone do not prove a better solution. Root plan approval and risk-specific authorization still apply, including on the fast path.

Use [context routing](context-routing.md) for bounded reads and [verification](verification.md) for checks. Report decisions, results, validation, and unresolved risks concisely; keep required task evidence and link to its owner instead of repeating it across documents.

## Fast Path

For an isolated typo, comment, tiny CSS change, or one-line defect: reproduce, make the smallest change, run the narrowest relevant check, and report it. Do not create ceremony that costs more than the risk.

## Standard / High-Risk Path

1. Inspect current Git state, affected code/dependencies, and baseline checks.
2. Keep exactly one active `wip-*` or `blocked-*` task.
3. Record a compact change contract:

```markdown
## Change Contract
- Human outcome:
- Acceptance evidence:
- Non-goals:
- Affected layers and owners:
- Risk level and required approvals:
- Baseline:
- Verification plan:
- Rollback or recovery:
```

4. Implement the smallest reviewable vertical slice; update affected PRD/index with behavior changes.
5. Verify at the real user boundary plus relevant automated layers.
6. Perform an independent final review against the contract.
7. Close only when all required evidence passes; otherwise keep active/blocked and name unverified criteria.

High-risk work includes auth/authorization, payments, destructive data migration, production infrastructure, secrets, and external side effects. Require explicit human scope, threat/risk review, rollback, staged operation, and observable success signals.
