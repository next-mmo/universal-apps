# Workflow Feedback: Spec and Implementation Task Duplication

- **Timestamp**: 2026-09-10T16:44:40+07:00
- **Skill / Workflow Area**: `nd-spec-feature`, `nd-task-status`, `.agents/docs/WORKFLOW.md`
- **Reporter**: User
- **Severity**: Low (Workflow usability & clutter)
- **Environment**: win32, Mavis desktop

## Observed Friction
When executing `nd-spec-feature`, the workflow creates a task checkpoint for specification drafting (e.g. `0003-native-portrait-help-header-spec.md`). After PRD approval, the workflow often generates a separate implementation task (e.g. `0004-native-portrait-help-header.md`). 

Both files end up archived in `tasks/done/` with nearly identical titles, backgrounds, scopes, and requirements. This creates unnecessary file bloat, context duplication, and confusion when inspecting past tasks.

## Proposed Improvement
1. **Single-Task Promotion**: For features executed as a single stream of work, do not generate a second task file. Instead, update the existing task file in place:
   - Switch `Mode` from `specification-only` to `implementation`.
   - Record scope approval details.
   - Append implementation plan and verification checks.
2. **Multi-Task Exception**: Only generate separate child task files (`0004`, `0005`, etc.) if the approved PRD splits into multiple distinct, parallel, or decoupled workstreams.
3. **Clarity**: Results in one single `done-*.md` per straightforward feature containing complete lifecycle audit trail from draft to delivery.
