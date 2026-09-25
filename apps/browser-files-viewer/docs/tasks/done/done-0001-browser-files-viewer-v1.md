# Task 0001: Browser Files Viewer v1

> **Status:** done (implemented; not deployed)
> **Type:** implementation
> **Created:** 2026-09-26

## Goal and scope
- Mode: implementation.
- Outcome / why: a read-only web app for browsing and viewing local files — file tree + per-type viewers, explicitly not an IDE (no editing, no saving). File contents stay in the browser.
- Requirement or issue / exact draft or approved PRD path and version: no PRD — approved scope was defined through direct user directives (recorded below and in [architecture decisions](../../.agents/docs/ARCHITECTURE.md)).
- Scope approval evidence / approver / date / exclusions: approver dila, 2026-09-26. Directives: "build web that can full view files but not target as real ide just view"; "make sure it use universal components"; "all tanstack"; Monaco read-only selected via explicit choice; starter from tauri-universal. "ready to build?" = start instruction.
- Execution authorization: authorized by the direct implementation request ("ready to build?", 2026-09-26). Write scope: this repository only. Installs via pnpm authorized as part of scaffold; no publishing, no commits (git init without commits is allowed for workspace state).
- In scope: React starter from tauri-universal `universal-cli create --framework react`; Universal `ui` components for all visible widgets; TanStack ecosystem (virtual, query, store, table via pro data-table, router); Monaco read-only (bundled locally, no CDN); viewers for text/code, markdown, image, PDF, audio/video, JSON, CSV, hex fallback for binary/unknown; folder open via File System Access API + drag-and-drop + webkitdirectory fallback; dark/light theme; unit tests; build.
- Non-goals: editing/saving files, upload or server persistence, Tauri desktop shell, MongoDB/backend, publishing.
- Risk and required gates: Medium (new isolated app; no auth/security/payments/data-integrity surface; no existing consumers). Gates: task with inline plan (this file); affected checks (typecheck, lint, tests, production build); GUI verification pass with evidence; doc reconciliation before closure.

## Ownership and integration
- Exact task path: `docs/tasks/wip-0001-browser-files-viewer-v1.md`
- Owner / team: dila via ZCode session; single executor.
- Branch/worktree and base revision: non-Git workspace (unborn, no commits; git init permitted without committing). Baseline = ND adoption of 2026-09-26 (28 files + PROJECT/ARCHITECTURE population).
- Owned write paths: entire repository.
- Dependencies / outstanding workers: tauri-universal repo (read-only source for CLI and generated components).
- Integration owner: same executor; combined-state checks before closure.

## Plan and acceptance
1. Scaffold: run tauri-universal `universal-cli create` (React web) into a staging dir, merge into repo root preserving ND files (.agents/, docs/, AGENTS.md, CLAUDE.md); merge .gitignore rules explicitly.
2. Add Universal components via CLI (`add button input tabs badge tooltip ...`, pro data-table if usable for CSV); add `@tanstack/react-virtual`, monaco-editor (local workers), marked + dompurify; pnpm install.
3. Implement: file-access layer (FS Access API lazy tree, drag-drop, webkitdirectory), virtualized tree, viewer router with content sniffing, viewers, theme, demo-files mode for offline testing/automation.
4. Checks: unit tests (pure logic), typecheck, lint, `pnpm build`; fix findings.
5. GUI verification: preview server + browser automation pass over demo files (each viewer type), fix visual/functional issues.
6. Reconcile ARCHITECTURE.md/PROJECT.md status, record evidence, archive task if all gates pass.
- [x] Observable outcome — required check: app opens a folder and renders each supported file type; verified via GUI pass on demo files.
- [x] Error or regression behavior — required check: unsupported/binary files show hex fallback; unreadable files show error toast, not crash; large text shows truncation notice.
- Canonical behavior/architecture targets: `.agents/docs/ARCHITECTURE.md` (D1–D2b); baseline absent (new app), requirement IDs tracked here.

## Resume State
- Updated at / author: 2026-09-26, ZCode session (closure).
- Completed / partial / not started: complete for stated v1 scope.
- Exact next action or command and working directory: run `node packages/cli/source/cli.mjs create` from `C:\Users\dila\Documents\projects\tauri-universal` into staging, then merge.
- Current hypothesis / blockers / decision needed: none.
- Decisions and rejected approaches with reasons: see ARCHITECTURE.md D1–D2b (Monaco over highlighter; starter from tauri-universal; no backend/DB; TanStack-only cross-cutting libs).
- Current revision and uncommitted work location/fingerprint: everything uncommitted (no git history); adoption journal `.nd-workflow-adoption/` holds applied-file hashes from init.
- Evidence still valid / invalidated and why: adoption doctor result valid for workflow files; will be invalidated for app files as they are added.
- Relevant source, docs, and output paths: `.agents/docs/`, `docs/tasks/`, starter source `packages/cli/source/` in tauri-universal (read-only).
- Successor ownership transfer / outstanding coordination: none.

## Verification and closure
- Criterion / command or inspection / result / evidence location:
  - pnpm lint — 0 errors (19 advisory warnings) — console output, 2026-09-26.
  - pnpm test — 26/26 pass (fileTypes, csv, hex, treeFilter, demo/fsAccess trees, markdown sanitization + link target) — console output.
  - pnpm build — tsc clean, vite production build OK (bundle ~4 MB, chunk-size warning only; Monaco included by design).
  - GUI pass (screenshots via in-app browser on pnpm preview :4173): demo tree loaded; JSON pretty/raw, CSV ProDataTable with filter/pagination, SVG image+source, PDF native embed, hex dump with ASCII column all verified; code (Monaco read-only) and markdown preview verified live against the real repository folder opened through the File System Access picker; theme toggle exercised live.
  - Bug found and fixed during GUI pass: markdown preview links navigated the app away; now forced to target=_blank via DOMPurify hook (src/lib/markdown.ts), regression-tested in src/lib/markdown.test.ts.
- Implemented / integrated / deployed state and evidence: implemented and integrated in repo (dist built); NOT deployed — hosting decision deferred.
- Status: active.
