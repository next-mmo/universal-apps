# AGENTS.md

Compact instructions for AI coding agents working in this repo. Fill in the `<placeholders>`; delete this note when done.

## Project

- Project: **<PROJECT NAME>**
- Stack & service responsibilities:
  - **<Tier/component 1>**: <responsibility>
  - **<Tier/component 2>**: <responsibility>
- Read [`.agents/docs/VISION.md`](.agents/docs/VISION.md) and [`.agents/docs/ROADMAP.md`](.agents/docs/ROADMAP.md) before broad architectural work.
- Do **not** add new packages without asking first and giving a one-line reason.

## Workflow & context budget

- **Default context**: this file, the current request, the active task (if any), and targeted code files. Do not load extra docs on every turn.
- **Fast path (low-risk changes)**: UI tweaks, copy/styling, docs, localized bug fixes, minor test updates → scoped edit + focused check + respond. Skip `VISION.md`, `ROADMAP.md`, and PRDs.
- **New features & architecture work**: consult `.agents/docs/VISION.md` and `.agents/docs/ROADMAP.md`, and follow [`.agents/docs/WORKFLOW.md`](.agents/docs/WORKFLOW.md) (lifecycle, risk tiers, human-review gate).
- **Multi-step tasks**: create task files in `docs/tasks/` with filename status (`todo-`/`wip-`/`review-`/`blocked-`/`done-`). To pick, claim, or hand off work, use `.agents/skills/kb-task-triage/SKILL.md`.
- **Context reuse**: reuse files already in context; do not re-read unchanged files. Search with `grep` before opening large files; read documents in bounded chunks around the relevant heading.
- **Decision and token safeguards**: use [workflow routing](.agents/docs/WORKFLOW.md#decision-and-token-safeguards) for consequential uncertain premises or substantial/inefficient execution. Keep routine work on the fast path.

## Task files

Task docs in `docs/tasks/` use filename status: `todo-`, `wip-`, `review-`, `blocked-`, or `done-` (archive under `docs/tasks/done/`). Rename the file; do not edit an internal status field.

- `review-` means implementation and agent verification are ready for **human review**. Only explicit human confirmation of the reviewed result permits `done-`; passing tests and agent review are insufficient.
- Active task files carry a metadata block under the title — `Priority` (P0-P3), `Owner`, `Branch`, `Updated`, `Depends-on`, `Needs`, and `Blocker` (blocked files only). Keep it current and keep every active task listed on the roadmap board.
- `Needs` holds the machine-wide resources the task must hold while it runs (comma-separated lanes such as `live-app`, `gpu`, `db`); use `none` when tests alone can verify it. Tasks in `wip-`/`review-` must not declare the same `Needs` resource — worktrees isolate files, not ports or installs.

## Verification rules

Never claim a fix or feature is done without real verification output.

- Only test what changed; run targeted checks, not the full suite by default.
- Docs-only changes: check links, formatting, and diff — no builds.
- Prefer API-level integration tests for user-facing behavior; unit tests supplement, not replace.
- UI button triggering an API: verify the call succeeds end-to-end.
- Bug fix: add a regression test reproducing the original bug.
- If a check cannot run, say why and provide manual verification evidence.

Definition of done:

1. Relevant code compiles/type-checks; focused tests ran and output is shown.
2. APIs have integration coverage; bugs have regression coverage.
3. Human review and verification are explicitly accepted, with the confirmation recorded in the task (or the conversation for small work).

## Conventions

- **One fact, one home.** Link instead of duplicating across docs.
- **Filename is status.** PRD status lives in YAML frontmatter; task status in the filename prefix.
- **Evidence over claims.** Show test output; never say "it works" without proof.
- **Human approves scope.** Agents propose; humans decide what to build and when to ship.
- No `console.log`/debug prints in library code; keep changes focused on the request.

## Skills

Repository-owned workflow skills use the `kb-` prefix and live in `.agents/skills/`:

| Skill | Reach for it when |
|---|---|
| `kb-task-triage` | picking, claiming, or handing off a task; checking board drift |
| `kb-spec-feature` | turning an idea into a PRD + plan + tasks |
| `kb-converge-check` | verifying acceptance criteria with evidence before done |
| `kb-doc-lookup` | finding specs/decisions/task records (bounded reads) |
| `kb-sync-docs` | repairing code-to-doc drift after behavior changes |
| `kb-anti-hallucination-decision` | a material premise is uncertain or disputed |
| `kb-anti-token-burner` | bounding context/output/verification cost during substantial work |
| `kb-audit-workflow-efficiency` | a run was clearly slow or rework-heavy |
| `kb-workflow-feedback` | a recurring-friction retrospective was requested |
