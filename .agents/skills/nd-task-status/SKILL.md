---
name: nd-task-status
description: Inspect project task board, active in-progress work, blockers, and backlog. Use when asked "what is in progress", "show backlog", "what is blocked", "project status", or before picking the next task to work on. Read-only inspection; does not modify tasks.
---

# Task Status: Task Board & Backlog Inspection

This skill inspects `docs/tasks/` to provide a consolidated task board, active WIP tracking, blocker diagnosis, and backlog ordering without modifying task files or starting unapproved work.

---

## When to Run This Skill

- When the user asks *"what is in progress?"*, *"show tasks"*, or *"status report"*.
- When the user asks *"what is blocked?"* or *"why is task X stuck?"*.
- When the user asks *"show backlog"*, *"what should we do next?"*, or *"what is planned?"*.
- Before selecting a new task to work on, to confirm dependencies, active ownership, and priority.
- **Read-only**: Inspecting task status never authorizes starting, pausing, or modifying tasks.

---

## Task Board Inspection Procedure

1. **Scan `docs/tasks/` directory**:
   - `wip-*.md`: Active work in progress. Identify exact file path, owner, session, and latest Resume State. Skip stubs or pointers marked completed/archived that redirect to `done/*.md`.
   - `blocked-*.md`: Blocked tasks. Extract exact blocker, root cause, and required decision/action from top of file.
   - `todo-*.md`: Backlog / planned tasks. Extract goal, priority, mode, and dependencies.
   - `done/*.md`: Completed tasks. Check delivery state (implemented, integrated, deployed).
2. **Read Resume State on active tasks**:
   - For each genuine active `wip-*.md` (ignoring completed/archived stubs), read the `## Resume State` section using bounded reads.
   - Report: current owner, exact next action, tested state, and any unresolved dependencies.
3. **Format consolidated status report**:
   - **In Progress**: Active task IDs, owners, short goal, next action.
   - **Blocked**: Blocked task IDs, blocking condition, needed decision.
   - **Backlog**: Planned tasks ordered by priority and dependency eligibility.
   - **Recently Completed**: Latest 3–5 archived tasks from `done/`.
4. **Identify Next Eligible Work**:
   - Filter `todo-*.md` for tasks whose prerequisites and dependencies are met.
   - Recommend next task based on user priority; request explicit approval before starting.
