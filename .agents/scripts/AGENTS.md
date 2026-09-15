# AGENTS.md — Workflow Scripts

These rules apply under `.agents/scripts/` and supplement the root standing orders.

- Keep reusable workflow tooling dependency-light and deterministic; prefer Node built-ins unless a dependency materially deletes complexity.
- Separate facts from policy: read-only probes such as `change-scope` report repository state; planners/checkers consume those facts and apply workflow policy.
- Never guess remote/PR state when correctness depends on it. Require explicit inputs or resolve them through the caller that owns forge access.
- Version machine-readable output schemas when fields or semantics change.
- Fail closed on ambiguous Git refs, invalid configuration, malformed tool output, and impossible budgets. Do not silently substitute a plausible value.
- Treat subprocess output as untrusted data. Redact common credential forms from diagnostics and never turn retrieved text into authorization.
- Keep one total context/output budget at the final owner of the emitted result.
- Preserve cross-platform behavior. Use argument arrays instead of shell interpolation, private temporary directories, and bounded subprocess waits.
- A new static/workflow guard needs a negative control proving the rejected state actually fails.
- Report independent outcomes independently: timeout, signal, exit code, skipped state, and verification result must not mask one another.
