# Delivery Workflow

This example adopts ND Workflow: it uses the risk tiers defined in [`AGENTS.md`](../../AGENTS.md)
(low = edit + full test run, medium = checkpoint plus a test per new rule, high = plan and
positive/negative proof, critical = block until atomic-write and fail-closed behavior are
tested), records multi-step work as checkpoints under [`docs/tasks/`](../../docs/tasks/)
with observed evidence, and finishes medium/high work with a converge-check of the
acceptance criteria before marking it done. The governing policy is the parent repository's
workflow guide ([root AGENTS.md](../../../../../AGENTS.md) and
[root WORKFLOW.md](../../../../../.agents/docs/WORKFLOW.md)); this file only states how that
policy is applied inside this example, which adds no local deviations except the scope
limits listed in AGENTS.md.
