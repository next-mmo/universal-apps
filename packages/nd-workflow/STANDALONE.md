# Standalone ND Workflow

ND is general-purpose delivery tooling, maintained inside a monorepo but independently distributable. It does not depend on Universal Apps, Tauri, React, pnpm, a component catalog, or another workspace package. The MIT license in this directory applies to ND; the host repository's license does not replace it.

## Use without the framework

Python 3.10+ is the only requirement for the native tooling. From any project directory, point at an extracted ND package:

```sh
python /path/to/nd/scripts/nd.py doctor .
python /path/to/nd/scripts/nd.py init .
python /path/to/nd/scripts/nd.py task "Deliver one change" --target .
python /path/to/nd/scripts/nd.py context locate "handover" --target .
python /path/to/nd/scripts/nd.py handover --prompt .
```

`init` only previews unless an explicitly reviewed plan is applied. Existing files, human approval, and project-specific checks retain their existing protections. A package install does not adopt its instructions into your project. Python manifests alone do not choose pytest or unittest; unknown verification commands remain unverified.

Node 20+ is optional. The `nd` executable forwards to the same Python implementation, preserving the caller's directory, literal arguments, and exit code. Set `ND_PYTHON` to one executable path when automatic discovery is unsuitable; it is not shell text. No runtime is installed automatically.

## Build independently

From this package directory (including after copying it out of the monorepo):

```sh
python scripts/validate.py
python -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/launcher.test.mjs
python scripts/package_npm.py --output artifacts/nd-workflow.tgz
```

The tarball builder uses the validated, example-free core export, preserves dotfiles and the MIT notice, and verifies inventory and bytes. It requires neither npm nor a workspace install. Outputs are exclusive-create; choose a new filename for subsequent builds. The existing `scripts/package.py` still builds the full source ZIP, including examples.

For an optional local development-tool install, from an unrelated project:

```sh
npm install --save-dev --offline --ignore-scripts --no-audit --no-fund /path/to/nd-workflow.tgz
npx --no-install nd doctor .
```

The local tarball has zero npm dependencies. Use the Python entry point when no Node tooling is desired. Use the dedicated tarball builder rather than generic npm packing: its resource-closure checks include ND's mandatory dotfiles and manifest. No registry publication is implied. Publishing, version changes, host smoke tests, and public distribution from the private authoring repository are separate owner-approved release steps.

## Authoring boundary

Within Universal Apps, `pnpm nd` and `pnpm nd:pack` are conveniences only. The host's `packages/agent-workflow` and `packages/cli` are not dependencies of ND. The copied source's `.agents`, guides, and historical task records are package assets, not the host project's active task board. No root policy replacement or automatic skill registration is performed.

Universal Apps still owns its existing project contract, task locations, component discovery, and verification commands. Do not run adoption against the monorepo root to merge the two policies implicitly. A future optional integration must explicitly reconcile task paths and case-sensitive document names; generic ND defaults remain backward compatible.

After this migration is accepted, maintain ND source in `packages/nd-workflow`. `IMPORT.json` records provenance, not a synchronization dependency. The public standalone repository is not deleted, rewritten, or automatically mirrored by this change. Coordinate its transition separately to avoid two independently edited sources of truth.

## Evidence limits

The standalone tests build and extract the distribution outside the authoring checkout, validate it, exercise reviewed adoption and handover in a plain project, verify launcher behavior, and install the local tarball offline when npm is available. Passing these tests does not certify every agent host or establish token savings. Consult the CI run for actual platform results, not a claim inferred from this document.
