# Task: Platform plugin packages

## Scope and ownership
- User chose Cursor, Codex coding agent, Claude Code; packages and local validation only.
- Owner/integration: Mavis. No global install, marketplace registration, release tag or publish authorized.
- Root master unborn; preserve existing files and artifacts. New package version 0.1.0-beta.1 is local bundle identity only.

## Plan and acceptance
- [x] Verify official native manifest formats; record installed versions.
- [x] Build three deterministic bundles from canonical five skills; include resource closure and no hooks/MCP.
- [x] Preview-first project staging verifies hashes and preserves existing instructions; no global writes.
- [x] Tests pass for shared bodies, manifests, collision/tamper/path guards and resource checks.
- [x] Claude native validation passes; distinguish Codex/Cursor UI/runtime tests not executed.
- [x] Save guide/evidence and deliver bundles; no public directory claim.

## Resume State
- Current: Official docs confirm Claude .claude-plugin, Cursor .cursor-plugin, Codex portable plugin.json. Installed Claude 2.1.69, Cursor 3.19.19, Codex 0.147.0.
- Decisions: full allowlisted starter snapshot under each plugin, generated per-skill resource note, no duplicate skill authoring; no unattended adoption.
- Status: Completed for build/local structural validation; not installed or published.
- Exact task: `docs/tasks/done/done-0005-platform-plugins.md`.
- Next: User-authorized native client installation and fresh-session discovery/invocation tests, then publisher/license decisions before public submission.

## Verification evidence
- Source and clean Codex-bundled starter: 71 tests each, 68 passed, 3 existing Windows symlink-privilege skips. Eight plugin tests passed.
- Core validator: 59 files, 23 Markdown files, 50 relative links, root 392 words, five skill headers; PASS.
- Three extracted starter snapshots validated; canonical hashes and skill bodies preserved with generated resource note. Deterministic build, collision, tamper, path and stage/no-overwrite tests passed.
- Claude 2.1.69 `plugin validate`: exit 0, warning author metadata absent. Omitted deliberately pending real publisher identity. No model invocation or installation.
- Claude/Cursor: 68 archive entries each. Codex: 73 entries, including skill presentation YAML. Hashes and sizes: `docs/plugin-delivery-20260909.json`.
- Native log: `.validation/plugin-acceptance-20260909/claude-native.txt`. Install/reference guide `docs/PLUGINS.md`, indexed in docs catalog.
- No Cursor/Codex runtime loading or marketplace UI verified; no ChatGPT website support claimed. Source schemas checked against current official docs, not a guarantee installed clients implement every feature.
- No global configuration, installs, commits, tags, public repositories or marketplaces mutated. Version identifies unpublished package only.
- Blockers: No client marketplace installation approved; UI discovery/invocation remains unverified. Publisher/license/legal metadata needed before public launch.
