# Host record: MiniMax Code fresh-session loading (candidate-003)

Status: **OBSERVED, agent-level, pending ledger review.** Not a human onboarding run.

- Host: MiniMax Code (this runtime), author's workstation, Windows.
- Session: `mvs_af4f20bc8e864afe85e767daaae5889a` - a fresh read-only child session created for this drill, same workspace.
- What the session observed, in its own report:
  1. Project instructions loaded automatically: `AGENTS.md`, quoted from `AGENTS.md:1` and `AGENTS.md:6`.
  2. Skills discoverable by native discovery: the twelve `nd-*` names; one skill file opened explicitly by path (`.agents/skills/nd-doc-lookup/SKILL.md`).
  3. Risk rule: "a one-line auth fix" classified **Critical** with `.agents/docs/WORKFLOW.md:14`; the low-risk fast path does not apply.
  4. Checkpoint-only recovery: `docs/tasks/task-0012-internal-release-readiness-spec.md` next action and BLOCKED status recovered from the task file text alone.
  5. Integrity: zero files written; read/grep/glob only.
- Overall: **OBSERVED**.

## Limits

- This is an automated child session on the author's machine, not a fresh human user, not a different machine, and not a different host product.
- It exercises the loading and discovery path only; it does not test stale-evidence, draft-only or ownership-conflict negative scenarios (H3), which remain NOT RUN for this candidate.
- Codex CLI, Claude Code and Cursor hosts were not exercised for this candidate; their historical drill counts are not candidate-bound evidence.
- The drill session runs inside the same runtime that created it; a different-host repetition remains required before claiming host coverage.
