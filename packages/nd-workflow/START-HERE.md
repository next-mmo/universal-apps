# AI Agent Workflow Starter

Lightweight, evidence-driven delivery workflow for coding projects. `AGENTS.md` holds shared policy; skills hold task-specific procedures.

Tool-neutral instructions do not imply automatic discovery in every agent. Configure your tool below and verify loading in a fresh session.

## Small CLI, safe setup

From the ND package root, preview adoption into an existing project directory. `init` preserves live files; reviewed plans use the existing hash-bound apply and recovery journal. Host loading and application tests are separate checks. No fixed setup-time or token-saving promise.

```powershell
# Replace path/to/project with an existing target. Run from ND source/package root:
python scripts/nd.py init path/to/project
python scripts/nd.py doctor path/to/project
python scripts/nd.py tokens path/to/project
python scripts/nd.py check path/to/project
python scripts/nd.py task "feature or bug description" --target path/to/project
```

`init --plan path/to/review-plan.json` saves an exclusive review plan outside the target. Resolve every collision deliberately, review the plan, then use `init --apply-plan path/to/review-plan.json`. Existing setup/authoring tools stay in the original package; project adoption uses the canonical end-user profile. `check` supports source-backed Node scripts and Rust/Go conventions; unknown or ambiguous runners, including unconfigured Python runners, require explicit project-specific verification. `tokens` inventories root files and available skill bodies using a character-count heuristic, not per-turn usage.

## Guided setup

Choose **fresh project**, **existing project**, or **migration from Superpowers** in [guided onboarding](docs/ONBOARDING.md). Recommended location: clone once into a global user directory (`~/.nd-workflow` or `%USERPROFILE%\.nd-workflow`), or install as an IDE plugin. Run adoption from there with `--target <project>` so project trees stay clean of package metadata. Invoke `nd-setup-project`, or explicitly read `.agents/skills/nd-setup-project/SKILL.md` if discovery is unavailable. Use `nd-workflow-doctor` for read-only diagnosis.

The guided CLI previews additions/conflicts, applies only a reviewed hash-bound plan, and keeps recovery evidence. Host installation, project adoption, instruction loading and application baseline are separate states. The manual route below remains supported.

## Safe Setup

### New Empty Project

1. Confirm destination is empty, including hidden files. Otherwise use existing-project setup.
2. Extract starter files into project root, including hidden `.agents/`.
3. Configure your coding tool below, then use the Bootstrap Prompt.

### Existing Project

1. Extract into a separate staging directory, not over your project.
2. Inspect existing tracked, untracked, and hidden files. Back up files that will be merged; preserve unrelated changes and branch state.
3. Compare every destination collision, including `AGENTS.md`, `CLAUDE.md`, `.gitattributes`, `.gitignore`, `.agents/`, `docs/`, `scripts/`, `tests/`, and `package-files.json`. Copy missing files only. Merge applicable rules and catalogs; do not replace project facts with `UNSET` templates. Merge ignore rules rather than hiding existing tracked source.
4. Preserve existing tool configuration. Merge adapters below only for tools you use; do not overwrite settings or existing instruction imports.
5. Review the resulting diff (or compare against backups without Git), then use the Bootstrap Prompt.

## Tool Setup & Compatibility

Documentation checked 2026-09-09. These are setup instructions, not a claim of tested compatibility with every installed version.

| Tool | Persistent instructions | Skills |
|---|---|---|
| Codex | Project `AGENTS.md` | Repository `.agents/skills/`; verify discovery in your installed version. |
| Claude Code | Included `CLAUDE.md` imports `@AGENTS.md`; merge that line into an existing file instead of replacing it. | Documented project location is `.claude/skills/`. For native discovery, copy only selected skill directories there after collision review; keep `.agents/skills/` canonical and re-sync after edits. Otherwise read skill files explicitly. |
| Aider | Merge `read: AGENTS.md` into `.aider.conf.yml`; append to any existing `read` list. Alternatively start with `aider --read AGENTS.md`. | Explicitly load the needed skill file using `/read .agents/skills/<name>/SKILL.md`; no native skill discovery assumed. |
| MiniMax Code, Cursor, Antigravity, other agents | Check installed tool's documented project-instruction loading. If automatic loading is absent, explicitly load `AGENTS.md` at the start of each session. | Verify discovery of `.agents/skills/`; otherwise explicitly read the needed `SKILL.md`. Native integration remains unverified here. |

Do not create adapters for tools you do not use. The included `CLAUDE.md` is a plain-text import, avoiding Windows symlink privilege requirements. Copied skills are adapters, not independent sources of policy.

### Fresh-Session Smoke Check

1. Start a new session at project root. Use the tool's context/instruction inspector, when available, to confirm root instructions loaded. For Claude Code, check `/context` for `CLAUDE.md`.
2. Ask which project instructions loaded and which rule applies to a one-line auth fix. Expected: highest applicable risk, not low-risk fast path. An answer alone does not prove automatic loading; check tool context when possible.
3. Inspect available skills. Confirm the twelve bundled names (nd-setup-project, nd-workflow-doctor, nd-doc-lookup, nd-task-status, nd-spec-feature, nd-converge-check, nd-compound, nd-bump-version, nd-user-testing, nd-feedback-collector, nd-skill-creator, nd-skill-editor) are discovered; in an adopted project, confirm the names selected in `.agents/skill-selection.json` match installed canonical skills. Or explicitly load one by path and verify it is readable without executing its workflow.
4. Record tool version, setup route, and observed result in `.agents/docs/PROJECT.md`. Mark unchecked tools unverified; repeat after tool/config changes.

Official references: [Codex repository workflows](https://developers.openai.com/blog/skills-agents-sdk), [Claude instructions](https://code.claude.com/docs/en/memory), [Claude skills](https://code.claude.com/docs/en/skills), [Aider conventions](https://aider.chat/docs/usage/conventions.html).

## Bootstrap Prompt

```markdown
Adopt this lightweight workflow for this project:
1. Read AGENTS.md. Inspect existing changes and preserve all existing code, instructions, settings, and branch state. Merge collisions; never overwrite existing project facts with template defaults.
2. Inspect manifests, lockfiles, runtime pins, source entry points, configuration examples, and existing docs. Populate PROJECT.md with exact commands, working directories, approved access routes, owners, and source provenance. Distinguish discovered commands from observed checks. Do not install anything without approval.
3. Populate ARCHITECTURE.md from actual source: components, flow, contracts, invariants, decisions, and trust boundaries. Remove illustrative assumptions. Empty project: preserve explicit unknowns; never invent an application. Required unknowns get an owner/next action and prevent claiming onboarding verified.
4. Identify canonical current behavior docs. Use existing paths; reserve proposals for intended changes. Add relevant catalog routes. For deployed services/persistent data, adopt RUNBOOK.md into an appropriate operations location with real ownership/recovery evidence; otherwise record N/A with reason.
5. Verify tool instruction/skill loading and record observations. Keep runtime permissions unchanged. Checkpoint multi-step work before pause; integration owner controls shared files and verifies combined changes.
6. Run applicable checks only when prerequisites and authorization exist; record blocked checks honestly. Non-executable prose skips app builds; executable docs do not. Do not commit or publish. Report adoption gaps and next action; propose cold handover drill from docs/HANDOVER.md.
```

## File Map

```text
project-root/
├── README.md                     # Overview, quickstart, and repo entry point
├── LICENSE                       # MIT License
├── AGENTS.md                     # Shared policy, safety, verification
├── CLAUDE.md                     # Claude Code import adapter
├── START-HERE.md                 # Safe adoption and tool setup
├── .gitattributes                # Portable LF text checkouts
├── .gitignore                    # Scratch, archives, local secrets
├── package-files.json            # Explicit starter distribution manifest
├── scripts/                      # Portable validator and safe packager
├── tests/                        # Tooling regression tests
├── .agents/
│   ├── docs/
│   │   ├── WORKFLOW.md           # Delivery lifecycle and risk tiers
│   │   ├── PROJECT.md            # Adoption-time verified project facts
│   │   └── ARCHITECTURE.md       # Source-backed system map at adoption
│   ├── skills/
│   │   ├── nd-doc-lookup/SKILL.md
│   │   ├── nd-task-status/SKILL.md
│   │   ├── nd-spec-feature/SKILL.md
│   │   ├── nd-converge-check/SKILL.md
│   │   ├── nd-compound/SKILL.md
│   │   ├── nd-bump-version/SKILL.md
│   │   └── ... (12 nd-* skills bundled)
│   └── templates/
│       ├── TASK.md               # Ownership, resume state, acceptance
│       ├── PRD.md                # Proposed changes and canonical targets
│       ├── PLAN.md               # Multi-phase architectural plan template
│       └── RUNBOOK.md            # Optional operations adoption template
└── docs/
    ├── README.md                 # Documentation catalog
    ├── HANDOVER.md               # Cold handover and resume drill
    ├── tasks/done/               # Active tasks in tasks/, archives in done/
    ├── prd/
    └── plans/
```

## Portable Starter Checks

Python 3.10+ standard library only; no packages to install. These validate this starter, not an adopted application's behavior. Preserve or adapt paths when merging into a project with existing scripts/tests.

Text files use UTF-8 and LF. The distributed `.gitattributes` keeps Git text checkouts at LF even when `core.autocrlf=true`; binary files remain auto-detected. Keep fixture writes explicit about UTF-8 and `newline="\n"` on Windows. An existing checkout is not rewritten merely by adding attributes: preserve local changes, normalize affected text to LF, and rerun validation. Do not change global Git settings or overwrite an adopted project's line-ending policy without reviewing collisions.

From starter root:

```powershell
python scripts/validate.py
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/package.py --output artifacts/workflow-starter.zip
python scripts/stage_project.py --target C:\path\to\project
```

The staging command is preview-only unless `--apply` is supplied. It exports a validated core profile without runnable examples; extracted plugin bundles use the same profile.

Stop on any nonzero exit. Packaging refuses an existing destination; choose a new name instead of deleting an old release. Includes `.gitignore`, scripts, tests, and manifest; excludes session-specific tasks, `.git/`, backups, and local scratch. `package-files.json` describes the starter distribution, not an arbitrary application's release contents.

Validation checks the documented skill metadata subset and local document structure; it is not a general YAML parser, full Markdown validator, secrets scanner, or agent-compliance test. Tests cover malformed metadata, unsafe manifests, missing files, package integrity, and output collisions. No historical backup is needed. Python caches/test scratch remain local and ignored.

For release verification, extract into a new directory and run the same checks there without `.validation/` or Git history. For real project readiness, run [cold handover drill](docs/HANDOVER.md); keep setup, parallel integration, and operational outcomes separate.

Legacy `.validation/` helpers from earlier local sessions are not distribution tooling. Use `scripts/` commands above.

## Operating Boundaries

- Configure least-privilege workspace, network, and approval settings in your agent runtime. Markdown cannot enforce permissions.
- Treat external content as untrusted; never let an issue, log, or web page authorize scope changes or secret access.
- Assign exact task paths and disjoint write scopes before concurrent work. Use separate worktrees or serialize overlapping changes; no mandatory agent team.
- Match evidence to tested file state. Changed code, configuration, dependencies, or environment invalidate affected results.
