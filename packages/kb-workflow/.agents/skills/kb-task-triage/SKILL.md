---
name: kb-task-triage
sources: .agents/skills/kb-task-triage/scripts/task_drift.py
description: Triage the project task board — inventory docs/tasks, check drift against ROADMAP.md, rank what to work on next, and claim or hand off a task for another agent session. Use when asked what to work on next, what the current task is, to pick/claim/assign a task, to hand work to another session or agent, or at the start of a session that has no task yet.
---

# Task Triage

Decide what to work on next, claim it, or hand it to another session — using `docs/tasks/` as the
source of truth and the roadmap family as the priority view: `.agents/docs/ROADMAP.md` (the live
board), `ROADMAP-BACKLOG.md` (the queue behind it), and `ROADMAP-ARCHIVE.md` (frozen history, not read
during triage).

Status lives in the filename prefix (`todo-`/`wip-`/`review-`/`blocked-`, archive in `docs/tasks/done/`), so it
is never duplicated inside the file. The metadata block carries everything else the board needs
(priority, owner, branch, updated, dependencies, blocker).

## When to run this

- "What should I work on next?" / "pick a task" / "what's in progress?"
- "Assign this to the other session" / "hand this off" / "who owns task 0043?"
- Starting a session with no task, or returning after another session worked in this repo.
- Before creating a new task file, so you do not duplicate one that already exists.

For a plain status listing ("show tickets"), `.agents/skills/kb-doc-lookup/SKILL.md` already has a
ticket-status fast path — use it and skip the ranking here. Use this skill when the question is
*what next*, *who owns it*, or *is the board consistent*.

## Step 1 — Inventory (one command)

```bash
python3 .agents/skills/kb-task-triage/scripts/task_drift.py --table
```

It prints the triage table straight from the task metadata and the board rows — id and title, status,
priority, owner, branch, updated, `Needs`, and the board's own status text — sorted priority first,
stalest first. It is the same parser that validates the board in Step 2, so the table and the drift
report cannot disagree, and it replaces reading the metadata blocks by hand.

Open a full task body only for the one or two candidates you are about to recommend; the goal is a
decision, not a documentation review.

Canonical metadata block:

```
> PRD: [PRD-00NN](../prd/00NN-slug.md)  
> Priority: P1  
> Owner: Antigravity  
> Branch: dev  
> Updated: 2026-09-20  
> Depends-on: todo-0043, todo-0044  
> Needs: live-app  
> Blocker: one line, blocked-* files only  
```

Priority scale: `P0` current critical path · `P1` high · `P2` medium · `P3` backlog/later. Read the
leading `P<n>` token; a parenthetical qualifier such as `P3 (planned follow-up)` is context, not
a different priority.
Owner is a free-form session handle (the tool or machine the session runs as, e.g. `Antigravity`,
`ZCode/dev-laptop`); `unassigned` means anyone may claim it. Trailing two spaces keep fields on
separate lines when rendered.

`Needs` lists the machine-wide resources the task must hold while it runs, comma-separated. Define
your project's lanes once (AGENTS.md is a good home) and keep the names stable — for example
`live-app` (the shared local dev stack plus its data install), `gpu` (the single GPU lane), or `db`
(the development database). Use `Needs: none` when the task is verifiable by tests alone. Two
tasks in `wip-` or `review-` may not declare the same resource: git isolation (a worktree) fixes file conflicts but
cannot give two sessions the same port, device, or install, so a second claimant is serialized, not
isolated. The drift check fails on a duplicate.

## Step 2 — Drift check

```bash
python3 .agents/skills/kb-task-triage/scripts/task_drift.py
```

It exits non-zero on real drift: active tasks missing from the board or the queue (matched by task
file or by the PRD they link), roadmap links that do not resolve, a board row whose state word
disagrees with the file prefix (a pick or rename that never reached the table), two `wip-`/`review-` tasks
holding the same `Needs` resource, task files missing `Priority`/`Owner`/`Updated`, and `done-` files
never moved into `docs/tasks/done/`. An unowned `wip-` is reported separately as "attention" — that
is claimable work, not a failure. `ROADMAP-ARCHIVE.md` is link-checked but never counts as a listing,
so an active task parked in history is still reported. Step 1's run already printed this report; run
the command without `--table` when you only want the verdict. "Clean" means the metadata and the
roadmap agree; it says nothing about whether the top task is actually workable today, so always read
the candidate's own acceptance list before recommending it.

Treat the report as evidence, not as permission: fix metadata and roadmap rows that the user asked
you to work on, and surface the rest. Never silently rewrite a task another session owns.

Also spot-check reality against the filename for the tasks you recommend: a `todo-` file whose
acceptance list is fully checked may be ready for review: inspect its evidence and recorded human
acceptance before choosing `review-` or `done/`, rather than restarting implementation.

## Step 3 — Rank what is next

Apply in order; stop at the first rule that yields a candidate:

1. **Unblock first.** A `blocked-` task whose `Depends-on` is now satisfied (or whose `Blocker` is
   resolved) becomes runnable again — that is usually the highest-value work on the board.
2. **Finish before starting.** Resume an unowned `wip-` item before opening a new `todo-`. Half-done
   work carries context that a new task does not — unless the remaining acceptance items all need
   access this session does not have (credentials, runners, a cluster, a clean machine). The file
   prefix will not say so; check the unchecked boxes. Such a `wip-` is blocked in practice: report it
   first as blocked-in-practice, and name the best genuinely actionable task as the fallback.
3. **Priority.** `P0` → `P1` → `P2` → `P3`.
4. **Unblocks others.** Among equal priorities, prefer a task that other tasks name in `Depends-on`
   (for example `todo-0043`/`todo-0044` gate `blocked-0045`).
5. **Staleness.** Oldest `Updated` date first.

Surface `review-` tasks as awaiting human verification; do not rank them as claimable implementation work or restart them unless review requests changes. Skip anything owned by another handle, and skip `blocked-` items whose blocker still stands. Offer
the top 1–3 candidates with one line of reasoning each, and let the user choose — the roadmap is
human-prioritized; agents propose.

## Step 4 — Claim, assign, or hand off

**Claim for this session** (only after the user agrees, or when they explicitly told you to start):

1. `git mv docs/tasks/todo-NNNN-slug.md docs/tasks/wip-NNNN-slug.md` — keep the id and slug exactly;
   never renumber or reuse an id.
2. Set `> Owner:` to your session handle, `> Branch:` to the actual working branch (use the invoking agent's default prefix for a new branch unless the user specifies one), and `> Updated:` to today.
3. Update this task's row in `.agents/docs/ROADMAP.md` in the same commit: point the link at the new
   `wip-` filename and rewrite the Status cell to one line — `in progress — <next action>`. The row
   is the view every later session ranks from; a rename without it leaves the board describing work
   that is no longer where it says.
4. Re-run `python3 .agents/skills/kb-task-triage/scripts/task_drift.py`. It compares each row's state
   word against the file prefix, so it fails while a row still describes the state you just renamed
   away from.
5. Say so in your reply: task id, owner, branch, first action.

**Assign to another session** without doing the work: set `> Owner:` to that handle, leave the prefix
as-is (the owner flips it to `wip-` when they start), and add a short handoff note under the title:

```markdown
## Handoff note (2026-09-20)

- Done so far: <what is already in the tree / committed>
- Next action: <the single next step>
- Watch out: <gotchas, exact commands, files that must not be touched>
```

This is the pre-work mirror of the handoff record WORKFLOW.md requires when a task is finished.

**While a task is `wip` under another handle**, treat it and its files as read-only: report what you
see, do not edit the task or its code. Two sessions editing one task is the failure mode this
protocol exists to prevent. If a task's metadata is stale but you are not its owner, say so instead
of fixing it silently.

Record material state changes (`Updated`, a new `Blocker`, a satisfied `Depends-on`) in the same
commit or handoff as the work they describe — a stale `Updated` date makes every later triage wrong.

Keep one current summary at the top; update it rather than appending contradictory status paragraphs. Label old narratives as history. When parking your own task, release a shared `Needs` claim after coordinating any running process; do not retain the live lane while waiting on another task. Do not clear another owner's claim yourself.

**Ready for review:** rename `wip-` to `review-`, update the board row to `review — awaiting human verification`, and attach the existing verification evidence and human acceptance steps. Release unused resource reservations after coordinating running processes; `review-` reservations still conflict with `wip-`. Keep it active until the human responds. Requested changes return it to `wip-`; silence is not acceptance. Follow [human review](../../docs/WORKFLOW.md#human-review-before-done).

**Finishing a task after explicit human acceptance** records the reviewer, date, accepted scope/artifact and confirmation pointer, then flips the same row: drop it from the Active-work table, add it to "Recently
completed" only if it belongs to the five most recent (that list is capped, so older entries simply
leave — `docs/tasks/done/` and `CHANGELOG-PRODUCT.md` are the record), and re-run the drift check in
the commit that moves the file to `done/`. WORKFLOW.md step 8 asks for the roadmap update; the check
is what proves it happened. Also repair incoming links and outgoing relative links after the move; metadata drift does not check every document's links. Use [WORKFLOW.md closeout learning](../../docs/WORKFLOW.md#closeout-learning) only when there is a concrete signal, not as a mandatory retrospective.

## Step 5 — Report

Keep the answer to a table plus a short recommendation:

```
| Task | Status | Pri | Owner | Branch | Updated | Next action |
|---|---|---|---|---|---|---|
| wip-0039 CI mirror | wip | P0 | unassigned | dev | 2026-09-20 | live GitLab run needs credentials |
| todo-0038 Provider sync | todo | P1 | Antigravity | dev | 2026-09-20 | phases 0-1 done; verify remaining episodes |

Drift: todo-0038 is `todo-` while its phases 0-1 are marked complete — verify and use wip-/review-; done requires human acceptance.
Suggested next: resume wip-0039 (P0, only blocked on credentials).
```

Then state plainly what you did (claimed / assigned / nothing yet) and what you did not touch.

## Guardrails

- Use `.agents/skills/kb-spec-feature/SKILL.md` for new product specifications. For already authorized work, create a proportionate task using WORKFLOW.md; do not force a PRD for routine docs or fixes. Never renumber or reuse ids.
- Preserve historical outcomes in `docs/tasks/done/`. Authorized link repairs or missing handoff corrections are allowed; do not rewrite history or silently convert unverified outcomes to passes.
- Do not escalate a triage request into implementation, and do not claim a task the user only asked
  you to list.
- Keep the review cheap: one `--table` run, and at most a couple of full task bodies.
