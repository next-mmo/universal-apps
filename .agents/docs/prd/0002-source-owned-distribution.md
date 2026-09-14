# Source-owned distribution

Status: implemented for review; owner acceptance and release pending.

## Requirement

Companies must be able to run a development-time CLI that generates editable source into their project, without installing Universal Apps runtime libraries. Internal monorepo packages may remain the canonical authoring source.

## Acceptance criteria

1. Every non-legacy public runtime export is represented in a registry item. Packages without exports maps expose their source entries.
2. Generated implementations include their transitive local helpers, types and styles. No generated module imports `@package/*`.
3. Required third-party dependencies are declared; no CLI or internal runtime library is added to the consumer manifest.
4. Repeated generation is idempotent. Local edits require an explicit overwrite. Dry-run and diff do not write files.
5. Registry generation fails on unresolved source dependencies, unsafe paths or unsupported dependency specifications.
6. A packed CLI generates isolated React, Vue, Svelte and Native source catalogs without loading the authoring workspace.
7. Publishing and production release require owner acceptance, full target-framework builds and appropriate license review.

## Boundaries

This is the shadcn-style source-ownership distribution model, not a promise of parity with every upstream CLI flag or initializer. Tauri native backends and Native platform configuration remain application responsibilities. Existing maintainer apps and agent catalogs continue using workspace imports.

## Evidence

See `../evidence/source-owned-distribution.md`. Do not describe generated framework applications as production-verified until their independent build checks have passed.
