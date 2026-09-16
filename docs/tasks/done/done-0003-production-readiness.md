# Task 0003: Production Readiness Hardening

> **Status:** done  
> **Type:** production hardening  
> **Created:** 2026-09-16  
> **PRD:** `docs/prd/0001-tauri-universal-platform.md`

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: Approved 2026-09-16
- Execution authorization: Approved 2026-09-16
- Exact next action: none. All tests, security audits, and release workflows verified green. Closed to `done/`.

## Outcome

Harden the repository for production deployment, cross-platform stability on Windows and Linux, zero security vulnerabilities, hardened desktop shell security, and automated CI/CD release pipelines for npm packages and Tauri binaries.

## Change Contract

- **Human outcome:** Monorepo tests run cleanly across platforms, production dependencies have zero known vulnerabilities, Tauri desktop app has strict CSP and production identifier, and automated GitHub Actions workflows handle release packaging and distribution.
- **Acceptance evidence:**
  - `pnpm test` passes 100% on Windows and Linux.
  - `pnpm audit --prod` reports 0 vulnerabilities.
  - `apps/tauri-app/src-tauri/tauri.conf.json` includes strict CSP and domain identifier.
  - `.github/workflows/release.yml` is defined for npm and Tauri releases.
  - `pnpm workflow:check`, `pnpm docs:check`, `pnpm build:web`, `pnpm source:smoke`, and `pnpm nd:check` exit 0.
- **Risk:** Medium (cross-platform test and dependency updates).
- **Baseline:** Commit `8bb20fc`.

## Acceptance Criteria

- [x] Uncommitted changes from Task 0002 baseline committed to git.
- [x] `packages/cli/test/source.test.mjs` passes on Windows without regression on Linux.
- [x] Vulnerabilities flagged by `pnpm audit` resolved via Vite upgrade and `pnpm.overrides`.
- [x] `tauri.conf.json` hardened with production identifier and strict CSP.
- [x] Automated release workflow `.github/workflows/release.yml` created.
- [x] `pnpm test` passes cleanly.
- [x] All verification checks pass (`workflow:check`, `docs:check`, `build:web`, `nd:check`, `source:smoke`).

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Task 0002 baseline committed | `git commit` cleaned working tree from 102 uncommitted files | Verified |
| Cross-platform CLI test pass | `packages/cli/test/source.test.mjs` passes (34 pass, 0 fail) | Verified |
| Zero prod CVEs | `pnpm audit --prod` reports 0 vulnerabilities with Vite 7.3.6 | Verified |
| Tauri CSP and ID hardened | `tauri.conf.json` identifier set to `com.nextmmo.tauri-app` and strict CSP added | Verified |
| Release CI created | `.github/workflows/release.yml` created with npm & Tauri matrix jobs | Verified |
| Monorepo test suite clean | `pnpm test` passes 100% (foundation, agent, mcp, source) | Verified |
| Smoke & Web distribution pass | `pnpm source:smoke` (4/4 frameworks) and `pnpm build:web` pass | Verified |
| Full verification clean | `workflow:check`, `docs:check`, `build:web`, `nd:check` all exit 0 | Verified |
