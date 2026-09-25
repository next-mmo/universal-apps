---
name: nd-feedback-collector
description: Collect real-world user feedback, usability frictions, bug reports, and workflow improvement suggestions. Use when asked to "report feedback", "record friction", "save feedback", or "log workflow bug".
---

# ND Feedback Collector: Workflow Feedback & Bug Recording

This skill collects structured user feedback, friction logs, and bug reports encountered during agent workflow execution without mutating executable skill code.

---

## When to Run This Skill

- When a workflow step encounters user confusion, host friction, or unexpected errors.
- When the user explicitly provides feedback or suggests workflow improvements.
- When an edge case or prompt ambiguity is identified during skill execution.

---

## Feedback Collection Procedure

1. **Gather Context**:
   - Relevant skill or workflow area (e.g. `nd-spec-feature`, `nd-task-status`, or general).
   - Observed behavior vs expected outcome.
   - Host platform, agent CLI version, and operating system.
   - Severity: `low` (formatting/clarity), `medium` (confusion/workaround), `high` (blocking/failure).

2. **Determine Storage Location**:
   - Skill-specific: `.agents/skills/nd-<skill>/feedback/YYYYMMDD-HHMMSS-<slug>.md`.
   - General workflow: `.agents/feedback/YYYYMMDD-HHMMSS-<slug>.md`.
   - Ensure the directory exists (`New-Item -ItemType Directory -Force`).

3. **Format & Write Feedback Record**:
   - Write timestamp, reporter, severity, observed friction, and proposed improvement.
   - Do NOT edit the skill instructions or code directly in this step.
   - Note: Feedback records are retained locally and excluded from distributable plugin bundles.

4. **Confirm Record**:
   - Verify the markdown file was written successfully and report path to user.
