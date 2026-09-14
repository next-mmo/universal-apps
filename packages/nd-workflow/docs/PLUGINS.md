# Workflow Starter Plugins

Local beta packages for Claude Code, Cursor, Codex, ChatGPT, Windsurf, and Continue. Twelve on-demand skills share canonical source in `.agents/skills/`. Packaging version `0.1.0-beta.1` identifies these bundles only; no root release tag or public listing exists.

## What you receive

- Twelve skills: nd-setup-project, nd-workflow-doctor, nd-doc-lookup, nd-task-status, nd-spec-feature, nd-converge-check, nd-compound, nd-bump-version, nd-skill-creator, nd-skill-editor, nd-feedback-collector, nd-user-testing. QA includes a bundled [handoff contract](../.agents/skills/nd-user-testing/references/qa-handoff.md) for local status events, reports, bug tasks and draft PRDs; no automatic external issue publication. Active skills can be configured in `plugins/plugin-config.json` or overridden at build time via `--skills`.
- Guided adoption and read-only diagnosis: [ONBOARDING.md](ONBOARDING.md). Setup uses reviewed plans and recovery journals; no automatic global configuration changes. Doctor provides token-budget efficiency classification (`TOKEN_SAVER` vs `TOKEN_BURNER`).
- Platform manifest plus explicit resource-resolution note in generated skills.
- Closed core profile under `starter/`: policies, skills, templates, docs, and portable tooling. Runnable examples stay in the full source distribution, keeping plugin context and staging small. Feedback records are excluded from distribution packages.
- Preview-first staging helper; no hooks, MCP servers, telemetry, external commands on load, or automatic project edits.
- Codex presentation metadata includes display name, description, starter prompts and skill labels. Catalog UI layout remains controlled by the host; screenshot appearance is not guaranteed.

Plugin installation alone does not make its root policy standing project instructions. Existing project policy remains authoritative. Adopt needed rules/templates by reviewed merge. Do not install both repository skills and plugin copies unless duplicate selectors are intentional.

## Build locally

Python 3.10+ standard library; from this source repository root:

```powershell
python scripts/build_plugins.py --target claude-code --output artifacts/workflow-starter-claude-code.zip
python scripts/build_plugins.py --target cursor --output artifacts/workflow-starter-cursor.zip
python scripts/build_plugins.py --target codex --output artifacts/workflow-starter-codex.zip
python scripts/build_plugins.py --target chatgpt --output artifacts/workflow-starter-chatgpt.zip
python scripts/build_plugins.py --target windsurf --output artifacts/workflow-starter-windsurf.zip
python scripts/build_plugins.py --target continue --output artifacts/workflow-starter-continue.zip
python -m unittest discover -s tests -p 'test_plugins.py' -v
```

Output must not exist; use a fresh name. Generated bundles are derivatives, not editable source. Edit canonical skills/docs/config and rebuild. Skills keep canonical name/description and body, with one generated resource note. Publisher identity, license, repository URL and legal URLs are deliberately omitted until verified and chosen by owner; public submission still requires release hygiene.

## Claude Code

Extract Claude bundle to a new directory. Its `.claude-plugin/plugin.json` and `skills/` are at root. Local validation:

```powershell
claude plugin validate C:\path\to\extracted-plugin
claude --plugin-dir C:\path\to\extracted-plugin
```

Second command launches a session with this plugin; it is an explicit user action, not run by builder. In the selected project, invoke `/workflow-starter:spec-feature` or another namespaced skill. Check installed CLI help because command availability varies by version. Marketplace listing/persistent installation is separate; no fake publisher or marketplace URL provided.

## Cursor

Extract Cursor bundle; `.cursor-plugin/plugin.json` identifies native Cursor format. Official local test route is a folder under `~/.cursor/plugins/local/workflow-starter`, then restart or Developer: Reload Window and inspect Customize. Copying there changes user-level configuration: review/authorize that action separately; builder does not perform it.

Local imports may be disabled by organization policy. An installed marketplace version may take precedence. Skills can be selected manually in chat. Verify all seven appear in Customize and run a non-mutating routing prompt before adopting into work. This is not a VSIX; do not use `--install-extension` for these ZIPs.

## Codex

Codex bundle uses root `plugin.json` with Agent Plugins schema and `skills/`, with `extensions.com.openai.interface` for catalog presentation. Official compatibility path `.codex-plugin/plugin.json` is not needed for this portable package.

A local marketplace may expose the extracted directory. Example, relative to the marketplace root, not the `.agents/plugins/` folder:

```json
{
  "name": "workflow-starter-local",
  "interface": { "displayName": "Workflow Starter Local Beta" },
  "plugins": [{
    "name": "workflow-starter",
    "source": { "source": "local", "path": "./plugins/workflow-starter" },
    "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
    "category": "Productivity"
  }]
}
```

Save to `.agents/plugins/marketplace.json` only after collision review; place extracted plugin at `plugins/workflow-starter`. Use `codex plugin marketplace --help` and `codex plugin --help` for installed version. Registering/installing changes configuration, so no such action runs automatically. Repository skills under `.agents/skills` remain an alternative local authoring route; use one route to avoid duplicates.

## ChatGPT

Extract the ChatGPT bundle to inspect ready-to-use Custom GPT assets:
- `.chatgpt/plugin.json`: Metadata, instructions, and conversation starters.
- `INSTRUCTIONS.md`: Direct copy-paste instructions for the ChatGPT Custom GPT builder.
- `skills/` and `starter/`: Upload as knowledge files in the Custom GPT configuration.
- Pre-configured conversation starters for planning, verification, and compounding.

## Windsurf

Extract the Windsurf bundle into the target project or workspace:
- `.windsurf/plugin.json`: Metadata identifying the workflow extension.
- `.windsurfrules` and `.windsurf/rules/workflow.md`: Generated Cascade rule files with workflow guidance; verify actual host loading separately.

## Continue

Extract the Continue bundle to register slash commands and prompt templates:
- `.continue/plugin.json`: Metadata identifying Continue extension assets.
- `.continue/prompts/*.prompt`: Slash command prompts for `/spec-feature`, `/converge-check`, `/compound`, `/doc-lookup`, and `/bump-version`.

## Project adoption without overwriting

From extracted plugin root, use its actual filesystem location, not a guessed working-directory path:

```powershell
python scripts/stage_project.py --target C:\path\to\project
python scripts/stage_project.py --target C:\path\to\project --apply
```

Preview lists collisions but writes nothing. Apply creates only `<project>/.workflow-starter-review/`, fails if it exists, and does not merge any live project file. The same command also works from this source repository; source and extracted-plugin modes stage the same validated core profile and exclude `example/`. Review and selectively merge desired files; do not erase existing architecture, settings, indexes, or instructions. Treat staging as a review copy, not automatically loaded project policy. Preserve partial staging on failure for diagnosis; no cleanup deletes user files.

Before invocation, target project must have appropriate permissions and scope. Missing project templates can be read from bundled starter; project-specific facts must come from actual source. Bundled release scripts concern this starter distribution only.

## Acceptance and compatibility evidence

Automated gates: six generated target layouts; exported-core validation and resource closure; example exclusion; source/plugin staging equivalence; deterministic packaging; unsafe/malformed manifest rejection before content reads; preview no-write; staging preserves existing files and refuses repeat application; tampered bundle rejection; fresh-process staging outside the repository.

Native Claude manifest validation can run without model calls. Cursor UI discovery and Codex installed-skill invocation require explicit install/session smoke tests. A valid JSON manifest does not prove UI listing, implicit routing, model behavior, policy enforcement, or public marketplace acceptance. Fresh-session test: request plan for approved scope, critical handling for one-line auth change, and checkpoint before handover; inspect selected skill and paths without production edits.

Documentation checked 2026-09-09:
- Claude: https://code.claude.com/docs/en/plugins-reference.md
- Cursor: https://cursor.com/docs/plugins.md
- OpenAI skills: https://developers.openai.com/codex/skills.md
- OpenAI packaging: https://developers.openai.com/plugins/build/plugins.md
- Portable schema: https://agent-plugins.org/schemas/1.0.0/plugin.schema.json

Current docs can exceed installed client features. Record actual client versions and native test results separately. None of these packages is published, endorsed, or certified by its host vendor.
