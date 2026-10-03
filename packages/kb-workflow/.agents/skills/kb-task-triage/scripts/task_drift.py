#!/usr/bin/env python3
"""Report drift between docs/tasks and .agents/docs/ROADMAP.md.

Reads the roadmap family: ROADMAP.md is the live board (state checks apply only to it),
ROADMAP-BACKLOG.md counts as "listed" for queued PRD-tracked tasks, and ROADMAP-ARCHIVE.md is
link-checked only, so an active task parked in history is still reported.

Checks:
  - active task files not listed in ROADMAP.md or ROADMAP-BACKLOG.md
  - roadmap links whose target file is missing (any file in the family)
  - a ROADMAP.md row whose status words disagree with the file prefix (pick/rename not reflected)
  - two in-progress/review tasks claiming the same machine-wide resource (Needs:)
  - active task files missing Priority / Owner / Updated metadata
  - wip- files with no owner
  - done- files left in docs/tasks/ instead of docs/tasks/done/

A done- row may stay in the "Active work" table until it is moved out; that is house style, not
drift. Only the state word is compared.

Usage: python .agents/skills/kb-task-triage/scripts/task_drift.py [--table] [repo_root]
  --table  print the triage table (id, state, priority, owner, branch, updated, needs, board status)
           before the drift report, so one run answers "what is on the board and is it consistent"
Exit code 0 when clean, 1 when drift is found.
"""
import re
import sys
from pathlib import Path

REQUIRED_FIELDS = ("priority", "owner", "updated")
FIELD_RE = re.compile(r"^>\s*([A-Za-z-]+):\s*(.*?)\s*$")
LINK_RE = re.compile(r"\]\(([^)]+)\)")
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]*\]\([^)]*\)")
FILE_STATES = (("todo-", "todo"), ("wip-", "wip"), ("review-", "review"), ("done-", "done"))
ROW_STATES = (("in progress", "wip"), ("review", "review"), ("done", "done"), ("todo", "todo"))
BOARD_FILE = "ROADMAP.md"
QUEUE_FILES = ("ROADMAP-BACKLOG.md",)
HISTORY_FILES = ("ROADMAP-ARCHIVE.md",)
EXTERNAL_PREFIXES = ("http://", "https://", "#", "mailto:")
SKIP_LANES = ("", "-", "none")


def metadata_block(path: Path) -> dict:
    """Collect the metadata block: the run of blank/heading/blockquote lines at the top.

    Reading a fixed number of lines truncates blocks that carry extra fields or notes,
    so stop at the first body line instead.
    """
    fields = {}
    for line in path.read_bytes().decode("utf-8").replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if stripped.startswith(">"):
            match = FIELD_RE.match(line)
            if match:
                fields[match.group(1).lower()] = match.group(2)
        elif stripped and not stripped.startswith("#"):
            break
    return fields


def row_state(line: str) -> str:
    """State word a roadmap row's prose describes, or "" when it names no state.

    Links are stripped first: a row may mention another task by reference, and that label or path
    must not be mistaken for this row's own status. Bare task-id references such as "todo-0043" are
    stripped for the same reason. The leftmost state word wins, so a status such as
    "in progress - local verification done" stays an in-progress row.
    """
    text = MARKDOWN_LINK_RE.sub(" ", line).lower()
    text = re.sub(r"\b(?:todo|wip|review|done|blocked)-\d+", " ", text)
    found = [(match.start(), state) for token, state in ROW_STATES
             if (match := re.search(r"\b" + re.escape(token) + r"\b", text))]
    return min(found)[1] if found else ""


def linked_targets(text: str, base: Path, issues: list, label: str) -> set:
    """Resolve every relative link in a roadmap file, reporting targets that do not exist."""
    targets = set()
    for match in LINK_RE.finditer(text):
        target = match.group(1)
        if target.startswith(EXTERNAL_PREFIXES):
            continue
        resolved = (base / target).resolve()
        if resolved.exists():
            targets.add(resolved)
        else:
            issues.append(f"{label}: link target missing: {target}")
    return targets


def roadmap_rows(text: str, base: Path) -> dict:
    """Map each linked task file to its row: the state word and the status cell text.

    In a table row the status is the cell immediately left of the link (the Active-work and Blocked
    tables both put it there); a bullet has no cells, so its whole line is the status. Classifying
    from the status cell rather than the whole row keeps a task's own title from reading as state.
    """
    rows = {}
    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped.startswith(("|", "-")):
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")] if stripped.startswith("|") else []
        for match in LINK_RE.finditer(stripped):
            target = match.group(1)
            if target.startswith(EXTERNAL_PREFIXES):
                continue
            status = ""
            if cells:
                status = next(
                    (cells[index - 1] for index, cell in enumerate(cells) if target in cell and index), ""
                )
            rows[(base / target).resolve()] = {
                "state": row_state(status if cells else stripped),
                "status": status,
            }
    return rows


def task_label(path: Path) -> str:
    """Short table label: the id from the filename plus the task's own title."""
    match = re.match(r"(?:todo|wip|review|blocked|done)-(\d+)-", path.name)
    label = match.group(1) if match else path.stem
    for line in path.read_bytes().decode("utf-8").replace("\r\n", "\n").split("\n"):
        if not line.startswith("# "):
            continue
        title = re.sub(r"^task:?\s*", "", line[2:].strip(), flags=re.IGNORECASE)
        title = re.sub(r"^(?:\d+\s*[-—–:]\s*|(?:todo|wip|review|blocked|done)-\d+[-—–:]?\s*)", "", title, flags=re.IGNORECASE)
        return f"{label} {title}".strip()
    return label


def triage_table(entries: list) -> str:
    """Render active tasks as the triage table: priority first, stalest first within it."""
    lines = [
        "| Task | Status | Pri | Owner | Branch | Updated | Needs | Board status |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for path, fields, board in entries:
        lines.append(
            "| {label} | {state} | {pri} | {owner} | {branch} | {updated} | {needs} | {status} |".format(
                label=task_label(path),
                state=path.name.split("-", 1)[0],
                pri=fields.get("priority") or "?",
                owner=fields.get("owner") or "?",
                branch=fields.get("branch") or "?",
                updated=fields.get("updated") or "?",
                needs=fields.get("needs") or "-",
                status=board.get("status") or "not on the board",
            )
        )
    return "\n".join(lines)


def main() -> int:
    args = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
    show_table = "--table" in sys.argv[1:]
    root = Path(args[0]).resolve() if args else Path.cwd()
    tasks_dir = root / "docs" / "tasks"
    docs_dir = root / ".agents" / "docs"
    board = docs_dir / BOARD_FILE

    if not tasks_dir.is_dir() or not board.is_file():
        print(f"cannot locate docs/tasks or {BOARD_FILE} under {root}")
        return 1

    issues = []
    notes = []
    lanes = {}
    active = sorted(
        path for pattern in ("todo-*.md", "wip-*.md", "review-*.md", "blocked-*.md")
        for path in tasks_dir.glob(pattern)
    )

    def read(path: Path) -> str:
        return path.read_bytes().decode("utf-8").replace("\r\n", "\n")

    # An active task is "listed" when the live board or the queue links it (directly or via its PRD).
    # The archive is link-checked but never counts as listed: an active task parked in history is drift.
    roadmap_targets = set()
    for name in (BOARD_FILE, *QUEUE_FILES):
        path = docs_dir / name
        if path.is_file():
            roadmap_targets |= linked_targets(read(path), docs_dir, issues, name)
    for name in HISTORY_FILES:
        path = docs_dir / name
        if path.is_file():
            linked_targets(read(path), docs_dir, issues, name)

    # State rows come from the live board only, so a frozen archive row cannot speak for a live task.
    described = roadmap_rows(read(board), docs_dir)

    table_entries = []
    for path in active:
        # A backlog task is listed when the roadmap links the task file itself or the
        # PRD it belongs to, so PRD-tracked backlog items are not reported as orphans.
        candidates = {path.resolve()}
        head = read(path).split("\n")
        for line in head:
            stripped = line.strip()
            if stripped and not stripped.startswith((">", "#")):
                break
            for match in LINK_RE.finditer(line):
                target = match.group(1)
                if not target.startswith(EXTERNAL_PREFIXES):
                    candidates.add((path.parent / target).resolve())
        if not candidates & roadmap_targets:
            issues.append(f"{path.name}: not listed in {BOARD_FILE} or {QUEUE_FILES[0]} (task or its PRD)")
        file_state = next((state for prefix, state in FILE_STATES if path.name.startswith(prefix)), "")
        row = described.get(path.resolve(), {})
        if file_state and row.get("state") and row["state"] != file_state:
            issues.append(
                f"{path.name}: ROADMAP row says '{row['state']}' while the file is '{file_state}-'"
                " - update the row in the same commit as the rename"
            )
        fields = metadata_block(path)
        missing = [field for field in REQUIRED_FIELDS if field not in fields]
        if missing:
            issues.append(f"{path.name}: missing metadata field(s): {', '.join(missing)}")
        if path.name.startswith("wip-"):
            owner = fields.get("owner", "").strip().lower()
            if owner in ("", "unassigned"):
                notes.append(f"{path.name}: wip with no owner - claimable, or move it back to todo-")
        if path.name.startswith(("wip-", "review-")):
            for lane in (token.strip() for token in fields.get("needs", "").split(",")):
                if lane not in SKIP_LANES:
                    lanes.setdefault(lane, []).append(path.name)
        table_entries.append((path, fields, row))

    for lane, claimants in sorted(lanes.items()):
        if len(claimants) > 1:
            issues.append(
                f"{lane}: held by {len(claimants)} in-progress/review tasks ({', '.join(sorted(claimants))})"
                " - shared machine-wide resources are not isolated by worktrees; keep one live claimant at a time"
            )

    for path in sorted(tasks_dir.glob("done-*.md")):
        issues.append(f"{path.name}: done task still in docs/tasks/ - move it to docs/tasks/done/")

    if show_table:
        table_entries.sort(
            key=lambda entry: (
                entry[1].get("priority", "")[:2] or "P9",
                entry[1].get("updated") or "9999-99-99",
            )
        )
        print(triage_table(table_entries))
        print()

    if notes:
        print(f"attention ({len(notes)}):")
        for note in notes:
            print(f"- {note}")
        print()

    if issues:
        print(f"task drift: {len(issues)} issue(s)")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print(f"task drift: clean ({len(active)} active task(s) checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
