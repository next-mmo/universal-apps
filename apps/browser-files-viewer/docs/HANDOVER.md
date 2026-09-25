# Developer and Agent Handover

Goal: successor can continue without original conversation or former employee's account. Preserve decisions and recoverable work, not every message. This guide is a drill, not proof it already passed for an adopted application.

## Before pause or transfer
1. Update the exact task's Resume State: progress, next action, blockers, hypotheses, rejected approaches, source/evidence paths, current revision and dirty work location. Record outstanding workers and who integrates.
2. Preserve uncommitted work in an authorized shared or durable location. A local branch or machine-only path is not accessible to another developer automatically. Do not commit, push, or upload without authorization; identify access blocker instead.
3. Reconcile changed system facts and decisions. Distinguish proposal from implemented, integrated, and deployed behavior. Keep evidence tied to tested state; state what must rerun.
4. Record ownership transfer to responsible team/person. Session IDs are supplementary history, not the only ownership route. Never store credentials in handover files.

## Successor resume
1. Read task checkpoint and necessary policy/reference sections. Verify checkout, branch, dirty state, access, and outstanding writers match recorded state before editing.
2. Inspect evidence and unresolved decisions; rerun checks invalidated by changed inputs. If checkpoint is incomplete, investigate source/docs first; ask only unresolved user-owned decisions.
3. Confirm ownership, integration plan, approval evidence and execution authorization against the current scope/version before taking the recorded next action. A specification-only checkpoint awaiting approval permits drafting, not implementation. Missing evidence is a decision blocker, not permission to trust a saved command. Update checkpoint before the next pause.

## Automated resume checks
`nd context check [PROJECT]` is read-only: it reports the active task's checkpoint fields (owner, scope approval, execution authorization, next action), ambiguity when several wip tasks exist, missing catalog anchors, cache freshness and recorded-revision mismatch. Exit 0 means READY; every other exit needs review. `nd context locate "<topic>" [--include-history]` returns at most five ranked routes with bounded excerpts and exact expansion pointers; historical tasks stay opt-in.

Neither command grants approval or ownership, and an index hit is not evidence of host loading. The derived cache lives in the ignored `.nd-cache/` directory and is disposable (`nd index build`). If the cache is missing, stale or corrupted, lookup falls back to scoped live search and says so; absence from the cache never proves absence from the repository.

## Cold handover acceptance drill
Use a clean checkout/extraction and a fresh developer/agent without previous chat. Do not remove access controls to make the drill pass.

| Scenario | Required proof |
|---|---|
| Setup | Follow PROJECT.md using approved access; run documented check without hidden local files |
| Understanding | Explain affected boundary and one significant decision from source-backed references |
| Resume | Continue a paused task using checkpoint; locate partial work and known failed approaches |
| Parallel integration | Combine two related changes, resolve shared edits, run combined-state checks |
| Recovery, if deployed | In approved safe environment, deploy, observe health/failure, rollback or restore and verify |

Record date, tool/runtime, tested revision/state, actor, command/inspection, evidence location, pass/fail/blocked, and limits per scenario. Record setup time, clarification count, repeated discovery, integration rework, and input tokens only when actually measurable. Set project-specific targets from observed baseline, not invented scores.

## What passes and what does not
- Portable starter script/tests passing proves tooling portability, not application setup, model compliance, production readiness, or guaranteed token savings.
- A read-only cold agent scenario can test document discoverability but does not substitute for real deployment/recovery.
- Missing access, unshared partial work, stale instructions, or unanswered required decisions mean blocked/incomplete handover, not done.
- Add operations details only for relevant systems using [runbook template](../.agents/templates/RUNBOOK.md). Add significant design rationale to architecture or a focused decision record; no mandatory ADR per task.
