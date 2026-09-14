---
name: nd-workflow-doctor
description: Diagnose ND Workflow adoption and instruction-loading gaps without edits. Use when users ask check workflow setup, why are ND skills missing, or is onboarding complete. Not for application bug diagnosis, global runtime repair, or automatically applying configuration fixes.
---

# Workflow Doctor

## Procedure
1. Resolve target and actual package location. Read existing project instructions. Locate scripts/workflow_doctor.py in source or extracted plugin; inspect help and run read-only diagnosis with target. Missing Python is a prerequisite gap, not permission to install. If script unavailable, inspect only relevant instructions, skill paths and project orientation files manually and state reduced coverage.
2. Interpret missing files, UNSET templates, missing local references, possible duplicate skill copies, Superpowers references and incomplete adoption journal. These are indicators, not proof of active host configuration. Existing canonical docs can legitimately replace starter paths; review project catalog before recommending duplicates. Do not scan global settings, secrets or application data.
3. Separate package availability, semantic project adoption, host instruction loading and application baseline. A readable SKILL.md or COMPLETE journal marker proves neither automatic discovery nor successful project adoption. Inspect host context in a fresh session when possible; otherwise mark loading UNVERIFIED with next action. Keep installed tool/version and selected repository/plugin route explicit.
4. Read source-backed development commands and their recorded evidence from project orientation. Do not run app commands during this diagnosis. Distinguish discovered command, prior result and current observed result. Recommend separately authorized checks; missing prerequisites and pre-existing failures remain visible.
5. Return prioritized findings with exact evidence paths, safe next action and owner. Repairs require setup-project or a separately scoped reviewed edit; no silent repair, uninstall, hook change, commit or publication.

## Output contract
Report four states individually: package available, project adopted, instructions verified, development baseline checked. Include findings, scope not inspected and next action. Script exit 0 means files present, 2 means attention, 1 means diagnosis failed; none means host or application verified. The report also carries `context_health` (active checkpoint completeness, ambiguous wip tasks, missing catalog anchors, cache freshness, host loading UNVERIFIED) as a separate section; it never certifies host loading or approval.

## Failure handling
Unsafe paths or unreadable metadata stop affected inspection. Preserve incomplete recovery journal and ask affected writers to stop before recovery review. Mark partial coverage instead of claiming healthy. Avoid reading journal backup contents unless recovery is explicitly in scope because they contain prior project text.

## Windows (win32) platform notes
Use installed Python 3.10+ with PowerShell and quoted actual paths. Doctor runs no application commands and writes no project files; do not redirect output into target unless user requested a saved report.
