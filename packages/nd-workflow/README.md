# ND Workflow: AI Agent Workflow Starter

Lightweight, evidence-driven delivery workflow for AI-assisted software development.

`AGENTS.md` holds shared policy; local skills hold task-specific procedures. Historical fresh-session checks were recorded on OpenAI Codex and MiniMax Code; current-candidate host verification remains incomplete. Setup routes and generated package targets have distinct coverage (see [START-HERE.md](START-HERE.md) and [docs/PLUGINS.md](docs/PLUGINS.md)).

**Evaluation build, not certified for production:** earlier readiness scores are withdrawn. Local test results do not replace real-user onboarding, declared-platform execution, independent review or maintainer signoff.

---

## Key Features

- **Spec before code:** [Delta PRDs](.agents/templates/PRD.md) and [task checkpoints](.agents/templates/TASK.md) prevent scope drift and duplicate specifications.
- **Risk-tiered gates:** Clear routing for low, medium, high, and critical changes in [WORKFLOW.md](.agents/docs/WORKFLOW.md).
- **Evidence-backed verification:** Structured checks, acceptance verification with `converge-check`, and durable learnings with `compound`.
- **Multi-platform package targets:** Generate reviewable bundles for Claude Code, Cursor, Codex, ChatGPT, Windsurf, and Continue via `scripts/build_plugins.py`. Local format tests pass; host installation, discovery, marketplace acceptance, and model behavior require separate smoke tests (see [PLUGINS.md](docs/PLUGINS.md)).
- **Runnable reference implementations:**
  - Full-stack Todo app in [example/full-stack-todo-express-vanillajs/](example/full-stack-todo-express-vanillajs/GUIDE.md).
  - Full-stack CMS Portfolio with auth in [example/full-stack-nd-workflow-cms-portfolio/](example/full-stack-nd-workflow-cms-portfolio/GUIDE.md). Example application tests do not certify complete workflow adoption or host loading.

---

## Benchmarks and Comparisons

**Why choose ND?** Keep low-risk work lightweight, raise verification with risk, and leave clear handover checkpoints. Built for small teams that want a shared delivery policy without a mandatory full execution loop for every change.

See [tradeoffs, evidence limits and the 9.7 challenge checklist](BENHMARK.md). Earlier score, speed and competitor-token claims are withdrawn; no measured superiority is established.

---

## Quickstart

### Small CLI, reviewed adoption

Run from the ND package root. Replace `path/to/project` with an existing project directory. `init` previews only; it never silently overwrites project facts. Use the guided reviewed-plan flow below to apply changes. No fixed setup-time or model-token saving is promised.

```powershell
# Preview only; use an existing target directory:
python scripts/nd.py init path/to/project
# Windows batch shortcut:
.\bin\nd.cmd init path/to/project

# Inspect adoption state; unknowns remain explicit:
python scripts/nd.py doctor path/to/project

# Run supported source-backed tests; unknown commands stop:
python scripts/nd.py check path/to/project

# Create a draft checkpoint (does not approve implementation):
python scripts/nd.py task "feature or bug title" --target path/to/project

# File-size heuristic only, not actual model usage:
python scripts/nd.py tokens path/to/project

# Read-only resume audit; stale cache never counts as current:
python scripts/nd.py context check path/to/project

# Bounded lookup (max five routes); history requires --include-history:
python scripts/nd.py context locate "handover" --target path/to/project

# Format fresh-agent handover prompt from active task:
python scripts/nd.py handover --prompt path/to/project

# Build or inspect the disposable derived cache (.nd-cache, ignored by Git):
python scripts/nd.py index build path/to/project
python scripts/nd.py index check path/to/project
```

### Guided onboarding

- **Fresh project:** ask `nd-setup-project` to add workflow only, before choosing an application stack.
- **Existing project:** ask `nd-setup-project` to preview adoption while preserving instructions, facts and uncommitted work.
- **From Superpowers:** ask `nd-setup-project` to inventory active work and guide replacement or coexistence.
- **Setup looks wrong:** ask `nd-workflow-doctor` for read-only findings.

Follow [guided onboarding](docs/ONBOARDING.md) for exact commands, reviewed merge and recovery. If skills are not discovered, explicitly load their files. [START-HERE.md](START-HERE.md) covers manual adoption and host setup. Plugin installation alone does not activate project policy.

### 2. Verify local starter integrity

Requires Python 3.10+ (standard library only; no external pip dependencies):

```powershell
python scripts/validate.py
python -m unittest discover -s tests -p 'test_*.py' -v
```

### 3. Package distributable zip

```powershell
python scripts/package.py --output artifacts/workflow-starter.zip
```

---

## Repository Map

| Path | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Universal agent instructions, risk precedence, and safety boundaries |
| [START-HERE.md](START-HERE.md) | Adoption steps, tool setup matrix, and portable checks |
| [CLAUDE.md](CLAUDE.md) | Claude Code import adapter pointing to `AGENTS.md` |
| [LICENSE](LICENSE) | MIT License |
| [docs/README.md](docs/README.md) | Topic catalog across specs, plans, tasks, and guides |
| [docs/PLUGINS.md](docs/PLUGINS.md) | Plugin building, distribution, and target agent configurations |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Session pause, developer handover, and cold recovery drill |
| [example/full-stack-todo-express-vanillajs/](example/full-stack-todo-express-vanillajs/GUIDE.md) | Reference Todo app (Express + vanilla JS) |
| [example/full-stack-nd-workflow-cms-portfolio/](example/full-stack-nd-workflow-cms-portfolio/GUIDE.md) | Reference CMS Portfolio with auth and full `.agents` adoption |

---

## License

This project is licensed under the [MIT License](LICENSE).
