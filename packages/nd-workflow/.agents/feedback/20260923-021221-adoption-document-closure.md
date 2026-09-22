# Feedback: adoption document closure and task routing

- Timestamp: 2026-09-23 02:12 Asia/Bangkok.
- Reporter: Codex, from the `9router-rust` ND Workflow adoption and follow-up documentation cleanup.
- Area: `nd-setup-project`, document migration checklist, onboarding guidance, and task routing.
- Host: Windows, PowerShell, Codex desktop; package CLI was run with Python 3.11.13 during adoption.
- Severity: medium (multiple follow-up rounds and manual link/task reconciliation; no application failure observed).

## Observed friction

The target had canonical behavior, parity, release, deployment, testing, and architecture documents. Adoption preserved them, but the final information architecture and lifecycle routing were unclear to the user. They subsequently asked whether old documents still existed, whether related work should be `task-*`/`done-*`, and whether category folders were needed. The cleanup moved seven canonical documents into `architecture/`, `features/`, `reference/`, and `operations/`, repaired inbound/outbound links, and added a blocked deployment task. The package's existing migration checklist covers inventories and link repair, but does not give a compact, reviewable closure view that answers these questions immediately after adoption.

The `nd context check` output correctly showed complete checkpoints while listing multiple blocked tasks as ambiguous. That is accurate, but users may read `ATTENTION` as incomplete adoption unless the handoff explains that they must choose an exact task path to resume.

## Expected outcome

The adoption handoff should show one canonical document map, one lifecycle task map, and any unresolved links or open owners. Category folders should be an optional, reviewed layout decision based on document volume and existing conventions. Existing content and historical evidence must remain discoverable.

## Proposed improvement

Add a concise post-adoption closure table to the `nd-setup-project` output contract and migration checklist: document role, canonical path, task status/path (when actual work exists), disposition, link-check result, and unresolved owner. Include an optional category-layout decision at Gate A, exact move/link operations at Gate B, and a final stale-reference/link audit. Make clear that a canonical document is not itself a task, and that a blocked deployment task does not authorize deployment. Explain expected `context check` ambiguity when several tasks are open.

Planning proposal: [plan-0005-adoption-document-closure.md](../../docs/plans/plan-0005-adoption-document-closure.md).

## Evidence and limits

- Target handoff: `C:/Users/dila/Documents/GitHub/9router-rust/docs/tasks/done/done-0009-categorize-canonical-documentation.md`.
- Final local Markdown audit: 29 files, zero broken repository-local links; target manifest and formatting checks passed.
- This record is feedback only. It does not authorize changes to ND Workflow skill instructions, CLI code, or distributable files.
