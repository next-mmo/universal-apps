# Verification and Evidence

Use the narrowest checks that can actually prove the changed behavior, then add broader checks when the affected boundary requires them. Tests are evidence, not automatic authority: reconcile stale or over-constrained tests with current code, approved acceptance criteria, PRDs, and explicit human decisions.

After required checks pass on the current state, repeat or broaden them only for new changes, failures, unresolved risks, or required freshness. Preserve meaningful regression and negative-path coverage; avoid tests that merely restate implementation or match prose to claim behavioral correctness.

## Scope Before Checks

For committed PR/branch work, verify the live base first and run:

```bash
pnpm change:scope --base <verified-ref>
pnpm verify:plan --base <verified-ref>
```

The scope report includes committed, staged, unstaged, and untracked paths. The verification plan maps that factual scope to the smallest known repository checks; it is a starting point, not proof that filename mapping sees dynamic loading, configuration, subprocesses, workers, providers, or external systems.

Do not guess the base from the current branch/upstream. Re-run scope and plan after a rebase, base retarget, or merge that changes the outgoing diff.

## Boundary Evidence

- Frontend: normal/loading/empty/error/offline states as relevant; keyboard/accessibility/responsive behavior; browser console; build.
- API: contract, validation, authorization, negative paths, retries/idempotency/concurrency as relevant.
- Domain: deterministic unit/boundary/property tests where useful.
- Data: constraints, migration compatibility, rollback/restore evidence.
- Security: denial paths, dependency/secret review, trust boundaries.
- Operations/release: config, health/metrics/logs, staged rollout and rollback trigger.
- Async/resource-owning tests and CI: load [reliability](reliability.md); prove deterministic synchronization and cleanup to quiescence.

For a new guard, validator, workflow check, or corpus rule, include a negative control that deliberately introduces the rejected case and proves the intended gate fails. For races, use barriers/state signals to prove overlap; repeated execution alone is stress evidence, not a deterministic regression.

For completed multi-step tasks record compact claim-to-proof evidence:

```markdown
## Evidence Ledger
| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Criterion | command, artifact, or visible flow | Passed/failed/skipped |
```

Never call skipped/unverified work passed. Separate baseline/environment failures from regressions caused by the change. Before handoff run the selected relevant checks, `pnpm workflow:check`, and `bash .agents/scripts/skill.sh check` when skills changed. CI owns broader platform/exhaustive coverage when configured; pending or absent CI is not a pass.
