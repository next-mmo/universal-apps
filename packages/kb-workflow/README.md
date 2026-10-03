# kb-workflow: Spec + Kanban Delivery Workflow Starter

A lightweight, evidence-driven delivery workflow for AI-assisted software development, extracted from the khmer-toolkit project's agent workflow. It ships as a scaffold (`.agents/` + `docs/` + `AGENTS.md`) that any repository can adopt — no framework dependency, no runtime.

**Core idea:** spec before code, a filename-status kanban board as the single source of task truth, and a human acceptance gate before anything is called done.

## What's inside

| Layer | Contents |
|---|---|
| `.agents/docs/WORKFLOW.md` | Delivery lifecycle (specify → plan → tasks → implement → verify → converge → ship → record), risk tiers, human-review gate, documentation lifecycle |
| `.agents/docs/` roadmap family | `VISION.md` + `ROADMAP.md` (live board) + `ROADMAP-BACKLOG.md` (queue) + `ROADMAP-ARCHIVE.md` (history) templates |
| `.agents/skills/` | Nine `kb-` agent skills (see below) |
| `.agents/templates/` | `PRD.md` and `TASK.md` skeletons matching the conventions |
| `docs/` | `README.md` topic router; empty `prd/`, `plans/`, `tasks/` (kanban) directories |
| `AGENTS.md` | Compact starter policy for coding agents (fill in the project placeholders) |

## Skills

| Skill | Use for |
|---|---|
| `kb-task-triage` | What to work on next; claim/hand off tasks; board drift check |
| `kb-spec-feature` | Turn an idea into a PRD in `docs/prd/` with frontmatter status |
| `kb-converge-check` | Prove every acceptance criterion with evidence before done |
| `kb-doc-lookup` | Bounded documentation/task lookup (route, filter, then read) |
| `kb-sync-docs` | Repair code-to-doc drift after behavior changes or folder moves |
| `kb-workflow-feedback` | Retro for recurring workflow friction |
| `kb-audit-workflow-efficiency` | Single-run / daily execution efficiency audit |
| `kb-anti-hallucination-decision` | Check consequential decisions for unsupported premises |
| `kb-anti-token-burner` | Bound context, tool output, and verification cost |

## Quickstart

Adopt into an existing project (preview first — nothing is overwritten):

```bash
node packages/kb-workflow/init.mjs path/to/project           # preview the plan
node packages/kb-workflow/init.mjs path/to/project --write   # create the missing files
```

Then, in the target project:

1. Fill in the placeholders in `AGENTS.md`, `.agents/docs/VISION.md`, and `.agents/docs/ROADMAP.md`.
2. Define your shared resource lanes (`Needs:` values such as `live-app`, `gpu`, `db`) in `AGENTS.md`.
3. Sanity-check the board: `python .agents/skills/kb-task-triage/scripts/task_drift.py` (requires Python 3; exits non-zero on drift).
4. Point your agent at `AGENTS.md` — the workflow takes over from there.

## The kanban in one minute

Task files live in `docs/tasks/` and **the filename is the status** — it is never duplicated inside the file:

```
todo-0043-add-provider-sync.md     → wip-0043-...  →  review-0043-...  → docs/tasks/done/done-0043-...
                     (claimed)        (ready for        (accepted; archived)
                                       human review)
```

Active files carry a metadata block (`Priority`, `Owner`, `Branch`, `Updated`, `Depends-on`, `Needs`, `Blocker`), and every active task has one row on the `ROADMAP.md` board. `task_drift.py` fails when the board and the files disagree, when two in-progress tasks hold the same machine-wide resource, or when a `done-` file was never archived.

PRDs live in `docs/prd/NNNN-slug.md` with YAML frontmatter status (`draft → approved → in-progress → shipped → archived`). Tasks link to the PRD criteria they implement; `review-` means *awaiting human acceptance* — agent checks and CI greens do not substitute for it.

## Source and scope

Extracted from the khmer-toolkit workflow (`.agents/docs/WORKFLOW.md` and its `kb-*` skills) and genericized: project-specific skills (app scaffolding, competitor research, release bumping, infra deploy) stayed behind. Keep the `kb-` prefix for repository-owned workflow skills when you add your own.
