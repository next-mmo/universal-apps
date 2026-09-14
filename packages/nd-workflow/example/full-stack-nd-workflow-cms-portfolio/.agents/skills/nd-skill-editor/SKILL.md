---
name: nd-skill-editor
description: Safely inspect and update existing ND skills while preserving structural contracts, frontmatter schemas, and safety boundaries. Use when asked to "edit skill", "update skill", or "refine skill".
---

# ND Skill Editor: Skill Modification Workflow

This skill provides a disciplined procedure for modifying, refining, or extending existing ND Workflow skills without breaking contracts or causing regressions.

---

## When to Run This Skill

- When updating instructions or commands within an existing skill.
- When fixing ambiguity, outdated links, or broken references in a skill.
- When refining trigger descriptions based on user interaction feedback.

---

## Skill Editing Procedure

1. **Inspect Existing State**:
   - Read `.agents/skills/nd-<name>/SKILL.md` completely.
   - Inspect any associated references in `.agents/skills/nd-<name>/references/`.
   - Check if any recorded feedback exists in `.agents/skills/nd-<name>/feedback/`.

2. **Formulate Minimal Changes**:
   - Preserve frontmatter schema (`name: nd-<name>`, `description:`).
   - Ensure the `name` continues to match the parent directory exactly.
   - Keep instructions concise to maintain token efficiency (<2,500 estimated tokens).

3. **Apply & Verify Edit**:
   - Apply edits to `SKILL.md`.
   - Check that relative Markdown links remain intact.
   - Run `python scripts/validate.py` to confirm repository and frontmatter validity.
   - Run `python scripts/workflow_doctor.py --target .` to verify token budget status.
