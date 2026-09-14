# Operations Runbook: <System>

Optional for deployable systems or persistent data. Copy into an appropriate existing operations location; register in catalog. Not required for an offline library with no operational service. Do not invent contacts, recovery guarantees, or production evidence.

## Ownership and access
- Responsible team/role and escalation route:
- Environment(s), infrastructure source, access-request route (no credentials):
- Last verified scope/date/revision and unresolved gaps:

## Deploy
- Release artifact/revision identity and prerequisite checks:
- Approved rollout steps and working directory:
- Migration order, compatibility window, irreversible operations:
- Health checks, expected signals, observation window, abort thresholds:
- Deployment record and deployed version location:

## Recover
- Rollback command/process and known constraints:
- Data backup location/access route, retention, restore process:
- Last restore exercise evidence; recovery targets if actually agreed:
- Safe incident triage, logs/metrics/alerts, escalation:
- Secret rotation procedure/reference and responsible role (never secret values):

## Drill
- Safe representative environment and approvals:
- Deploy, detect failure, rollback/restore, verify data and health:
- Observed results, limitations, and follow-up owner:

Production writes and irreversible actions require explicit approval. Failed or untested recovery remains visible; a build pass is not operational readiness.
