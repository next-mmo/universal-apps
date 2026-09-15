# Source-owned distribution evidence

## Implemented

A dependency-free consumer CLI, AST-based source graph builder, standalone package assembly, standard shadcn registry items, source-owned installation receipts, framework-filtered catalog generation, and safety regression tests.

## Local verification

`node --test packages/cli/test/source.test.mjs`: 28 tests passed, zero failed. Tests cover transitive source copying, import rewriting, cycles, missing/undeclared imports, Vue/Svelte script extraction, traversal/symlink rejection, edit protection, dry runs, idempotence, dependency preservation, package-manager selection, failure reporting, and isolated CLI execution. An actual npm tarball was built, unpacked, and used to generate all four framework catalogs from nine fixture packages. One generated framework-neutral TypeScript fixture was compiled and executed independently.

The authoring environment could read repository content through the GitHub connector but could not clone the repository or install its dependencies because container network access was unavailable. These local tests use controlled fixtures; they do not prove all existing framework components compile.

## Repository verification

The Source distribution workflow builds all nine runtime packages, packs the standalone CLI, unpacks it outside the authoring package tree, and generates each framework catalog in isolated consumer projects. Its result must be checked on the pull request. The smoke check intentionally uses `--no-install`; it verifies source ownership and packaging, not full framework compilation.

## Release gates

Owner acceptance, a passing repository source-distribution workflow, full generated React/Vue/Svelte/Native builds, native/Tauri integration checks as applicable, and license/provenance review. No npm publication or registry deployment has been performed.
