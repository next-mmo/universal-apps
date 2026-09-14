---
name: nd-skill-creator
description: Scaffold new ND-compliant skills with proper directory structure, YAML frontmatter, step-by-step procedures, and validation criteria. Use when asked to "create a new skill", "author skill", or "scaffold skill".
---

# ND Skill Creator: Skill Scaffolding Workflow

This skill guides the creation of new portable skills adhering to the Agent Skills specification and ND Workflow standards.

---

## When to Run This Skill

- When creating a new reusable procedure or domain capability.
- When standardizing an ad-hoc procedure into a durable workflow skill.
- When scaffolding skill files with compliant YAML frontmatter.

---

## Skill Authoring Procedure

1. **Define Skill Metadata**:
   - Determine canonical name: must use lowercase letters, numbers, and hyphens (`nd-<name>`), matching directory name exactly.
   - Compose description: 1–1024 characters describing both what the skill does and specific trigger phrases.
   - Frontmatter keys: only `name` and `description` are allowed.

2. **Scaffold Directory & Files**:
   - Create directory `.agents/skills/nd-<name>/`.
   - Create `.agents/skills/nd-<name>/SKILL.md`.
   - If reference documents are required, place them under `.agents/skills/nd-<name>/references/`.

3. **Structure Skill Body**:
   - Title heading matching skill intent.
   - **When to Run This Skill**: concrete trigger conditions and non-goals.
   - **Procedure**: numbered sequential steps with explicit boundaries.
   - **Verification**: commands and checks to confirm task completion.

4. **Validate**:
   - Run `python scripts/validate.py` to confirm frontmatter syntax and directory matching.
   - Run `python scripts/workflow_doctor.py --target .` to confirm token footprint remains within budget (<2,500 tokens).
