---
name: nd-compound
description: Capture reusable technical learnings, edge cases, and environment quirks after completing a task. Use when finishing non-trivial features, resolving tricky bugs, or when the user says "compound", "capture learnings", or "record gotchas". Prevents future agents from repeating the same mistakes.
---

# Compound: Capture Reusable Knowledge

Capture evidence-backed knowledge only when it changes future decisions. No-op is preferred over generic or transient entries.

---

## When to Run This Skill

- Immediately after a task converges and passes verification.
- After resolving an obscure bug, build failure, or environment discrepancy.
- When an undocumented framework quirk, API constraint, or edge case was identified.
- **Skip for trivial work**: do not record obvious steps, basic language syntax, or one-off typo fixes.

---

## What to Capture (High-Signal Filter)

Ask: **"Will a future agent act better or avoid a multi-hour rabbit hole because of this?"**

- **Keep**:
  - Hidden dependencies, version incompatibilities, or platform quirks (e.g. Windows CRLF / PowerShell quoting).
  - Subtle architectural constraints or race conditions.
  - Tricky mock requirements or test harness gotchas.
  - Undocumented CLI flags or configuration precedence.
- **Discard**:
  - Generic programming advice ("always test code").
  - Ephemeral outputs, timestamps, or full error stack traces.
  - Duplication of existing documentation or standard API references.

---

## Compounding Procedure

### Step 1: Formulate the Learning
Compress the takeaway into the **Rule -> Evidence -> Apply When** format:

```markdown
- **<Topic/Gotcha>**: <Concrete rule or constraint>
  - *Why/Evidence*: <What failed or was observed during task implementation>
  - *Apply When*: <Which files, modules, or commands this affects>
```

### Step 2: Search, then route
- Search existing docs and relevant source before writing. No durable, non-obvious learning means no-op, including after non-trivial work.
- Choose one canonical location: command/environment facts in PROJECT.md; boundaries/invariants in ARCHITECTURE.md; detailed topics in existing relevant docs. Keep overview short and update catalog if a new topic is genuinely needed.
- New information: add once. Duplicate: merge or no-op. Contradicted/obsolete advice: replace or retire it, preserving significant decision rationale where relevant. Do not append a conflicting rule.
- Record evidence/source, applicable version/environment, and last-verified scope. Do not promote an unverified hypothesis into standing policy.
- Cross-cutting operating constraints may justify a short AGENTS.md proposal; routine implementation history does not.
- Workers return shared-doc proposals to integration owner. Review-only tasks return recommendations without edits.

### Step 3: Verify and hand over
Read affected context, confirm evidence supports the rule and no conflicting entry remains. Recheck relevant links/docs checks after edits; do not rely on a completion record written before these changes. Report added, merged, corrected, retired, or no-op. Update task checkpoint when applicable.
