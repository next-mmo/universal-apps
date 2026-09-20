# Generated consumer compilation

> Recorded: 2026-09-20 · Tool: `pnpm source:compile` (`scripts/check-source-compilation.mjs`)

## What this check proves

`pnpm source:smoke` proves the CLI writes the right files. It does not compile them. This check
closes that gap: for each framework it runs `create` → `add --all` → a probe that imports every
generated module → install → the framework's own build. The probe matters, because the shipped
starter app does not import its generated source: adding all 63 generated React files to a starter
changed the bundle by **0 bytes** (223.16 kB with them and without them), so without the probe a
green build would say nothing about generated code.

## Current result

| Framework | Result | Detail |
| :--- | :--- | :--- |
| react | PASS | 63 generated modules install, type-check, and bundle |
| native | PASS | 43 modules; starter installs and builds |
| vue | UNVERIFIED | 3 type errors in `pro-vue/data-table/pro-data-table.vue` |
| svelte | UNVERIFIED | 8 errors and 5 warnings across 2 files |

Only frameworks in the `verified` list in the script can fail the gate. The others are printed as
UNVERIFIED on every run, with a warning, so a passing run is never evidence that they work.

## Defects found and fixed

- **Vue and Svelte starters shipped React code.** `universal create --framework vue|svelte` generated
  `core/use-todos.ts` — a React hook whose first line is `import { useCallback, useEffect, useState }
  from 'react'` — and declared `"react": "19.2.6"` as a runtime dependency of a non-React app. Two
  causes: `install.mjs` fell back to the `core` item for any framework that is not react or native,
  and `core`, documented as framework-neutral, contained a React hook. Fixed by scoping the file to
  a `core-react` item; the `core` item now declares zero dependencies. Svelte had hidden this
  entirely, because its build script ran `vite build` with no type-check step.
- **The native starter could not compile.** Its `tsconfig.json` carried no Uniwind type reference, so
  `className` on React Native primitives was rejected. Fixed by shipping `src/uniwind.d.ts`, matching
  `apps/native-playground` and the `native-bare` template.
- **The native starter could not be installed.** `@package/ui-native` declares
  `react-native-reanimated: ">=3.16.0"` as a peer; the registry propagated that open range into the
  consumer's `dependencies`, resolving to 4.7.0, which peer-requires `react-native@"0.86 - 0.88"`
  while the template pins `^0.81.4`. npm failed with ERESOLVE. pnpm tolerates the conflict, which is
  why the workspace never noticed. Fixed by declaring compatible ranges in the native template, which
  the installer preserves instead of adopting the peer range.
- **The Svelte starter had no type-check step.** Added `svelte-check --threshold error`. This needed
  two supporting fixes: a `src/vite-env.d.ts` declaring `*.svelte`, and `src/**/*.d.ts` added to the
  tsconfig `include`, because svelte-check's tsconfig discovery does not match declaration files
  through the `src/**/*.ts` pattern. `--threshold error` keeps a consumer build failing on real type
  errors rather than advisory warnings, matching the Vue starter's `vue-tsc`.

## Defects found and not fixed

- **`pro-vue/data-table/pro-data-table.vue` does not type-check** (3 errors). One is a genuine
  runtime bug, not only a typing complaint: `ref<VisibilityState>(() => …)` passes a function to
  `ref`, which stores the function as the value instead of computing it — Vue has no lazy `ref`
  initializer, so the table's column visibility state is wrong at runtime. The other two read
  `.variant`/`.label` from a `cellValue` that returns `unknown`.
- **`pro-svelte/data-table/pro-data-table.svelte` does not type-check** (8 errors, 5 warnings). The
  component threads `as never` casts through `filterRows`, `sortRows`, and `pageRows`, which leaves
  the row type as `unknown` in the template.

Both are left in place deliberately. They are public-contract typing decisions in the `pro-vue` and
`pro-svelte` data-table adapters, which PRD 0006 owns; resolving them means choosing the row generic
those components expose, which is a design decision rather than an annotation fix.

## Evidence

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| The gate can fail | Adding `vue` to the `verified` list made the run exit 1 with `source:compile: FAIL — vue did not compile in a consumer project`; the list was restored | Verified 2026-09-20 |
| The React leak is gone from Vue | Vue went from 13 to 12 generated modules and every `Cannot find declaration file for module 'react'` error disappeared | Verified 2026-09-20 |
| The `core` item is framework-neutral now | `dist/universal-cli/registry/index.json`: `core` has 0 dependencies and 3 files; `core-react` carries `react@19.2.6` | Verified 2026-09-20 |
| React still receives the hook | React compiles 63 modules including `core-react`, and `--all --framework react` installs it | Verified 2026-09-20 |
| Generated source is not bundled without the probe | The starter bundle was 223.16 kB both before and after adding all 63 generated files | Verified 2026-09-20 |
| Nothing else regressed | `pnpm test` exit 0; source tests 36 pass / 0 fail / 1 skip; `pnpm lint` 0 errors; `pnpm docs:check` and `pnpm workflow:check` pass | Verified 2026-09-20 |
