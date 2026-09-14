# Standalone ND package migration

## Approved scope

The owner approved moving ND into the monorepo's packages while explicitly requiring general use without framework lock-in, then requested implementation. This change imports ND at `04d875d63c5eac80d35e5c6fb329dcdefd02a393` into `packages/nd-workflow` from Universal Apps base `b78740a8fe315934a01265280c640bda722a8093`.

## Boundary

ND retains its Python implementation, generic policies, templates, default task paths, plugin builder, tests, and MIT license. The optional Node facade has no npm dependencies. Universal Apps gets only root command conveniences; existing framework packages and live project policy are not replaced or made dependencies of ND. No automatic policy adoption, skill registration, two-way synchronization, publication, or main-branch merge is included.

The package becomes the canonical authoring location after review/acceptance. The public ND repository is preserved; its retirement or distribution-only transition is a separate owner decision. Historical ND records inside the package are source assets, not this repository's active task board.

## Implementation and checks

- Package-local tarball building uses the existing validated core export, excludes example applications, preserves workflow resources and licensing, rejects npm dependencies, and verifies archive inventory and bytes.
- The launcher preserves the caller's cwd, argument boundaries, and child status. It reports missing Python rather than installing tools.
- Tests exercise an extracted package outside the monorepo, reviewed adoption into a plain project, task/handover/lookup, explicit unknown verification, offline npm installation, and plain Node check success/failure.
- Dedicated CI carries the original Python 3.10/3.11 and Linux/Windows/macOS matrix, source validation, original regressions, both transports, and example checks. It does not install the Universal Apps workspace.

Five launcher contract tests and a real-Python cwd/argument/exit-code smoke passed locally. Full ND and framework regression results must be read from the PR's current CI revision; they are not inferred from the local launcher checks. Local Git cloning was unavailable, so the exact source import and full artifact checks use the authenticated repository and GitHub Actions.

The installed-command smoke caught npm's removal of the mandatory ignore resource. The npm transport uses an explicit filename mapping; source exports restore the canonical filename. Missing resources and invalid mappings remain validation failures. No postinstall hook or silent fallback is introduced.

## Deferred integration

No implicit adoption into Universal Apps is attempted. ND's generic task defaults remain unchanged; the host continues using `.agents/docs/tasks`. See [standalone ND usage](../../../packages/nd-workflow/STANDALONE.md) for the package-owned conventions. Optional host integration must explicitly reconcile paths, document casing, and policies. Standalone capability is not a claim of complete host adoption, production certification, or token savings.
