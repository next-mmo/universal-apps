# Pre-test review corrections

Base reviewed: 2263fbe3f34fa57a224a2af70fb684c65999484b.
Scope approved by the owner: fix all six pre-test findings on the existing PR branch.

## Corrections

- Classify private manifest-only workspaces from validated filesystem contents.
  Plans report these as `metadataOnly`; source, scripts, entry points, dependencies,
  or symlinks revoke the exemption. Ordinary unverified packages still fail closed.
- Keep timeout escalation alive after a direct child closes. Complete POSIX group
  cleanup before returning a timeout, and wait for Windows taskkill completion.
- Resolve bounded public export graphs with TypeScript module resolution and
  per-extension parsing. Re-export targets, aliases, type-only edges, conflicting
  stars, missing exports, cycles, and parse errors are handled without execution.
  Metadata/source reads stay inside the workspace, including symlink resolution.
- Resolve direct symbols within the requested framework/runtime. Capability IDs
  still select a capability even when implementations expose different symbols.
- Detach task ownership before abort callbacks; preserve replacement tasks started
  by abort handlers, subscribers, reset, or superseding run calls.

## Local evidence

Node 22.16.0 and TypeScript 5.8.3. Initial source copies matched the Git blobs from
this PR. All six original findings reproduced before correction. The parser test's
compiler fixture now uses `types: []` to isolate it from host ambient Node types.

`node --experimental-strip-types --test packages/agent-workflow/test/review-regressions.test.mjs`

Result: 18 passed, 0 failed, 0 skipped on Linux. Includes the six regressions and
additional positive/negative cases for export chains and reentrant state changes.
Strict local TypeScript checking of the changed source modules also passed.

The local runner has no network access, so these are targeted source tests, not a
full installed-workspace result. Full pnpm discovery, original regression suites,
all consumer builds and explicit base-range planning are now CI gates. A separate
Windows job runs the foundation tests and real workspace inventory. The POSIX
resistant-descendant test is intentionally skipped on Windows.

## Acceptance gates and limits

Keep this PR in draft until the current commit's CI and human acceptance are
reviewed. CI results are attached to the PR, not inferred from these local tests.
Browser keyboard/visual checks and native mobile/Tauri Rust execution are separate
from web builds. No paid-model token-saving percentage is claimed. These changes
fix correctness and verification; they do not add unrequested product features.
