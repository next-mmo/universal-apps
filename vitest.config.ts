import { defineConfig } from 'vitest/config';

// The existing `node:test` suites under packages/{agent-workflow,cli,mcp}/test are run by
// `pnpm foundation:test` and `pnpm source:test`, so this runner deliberately claims only the
// packages that had no behavioral coverage at all. Keeping the include list explicit prevents a
// `node:test` file from being collected here and failing on a missing `test` global.
export default defineConfig({
  // The workspace has no root tsconfig.json, so the automatic JSX runtime is stated here rather
  // than inferred: components and tests rely on it instead of a React import in scope.
  esbuild: { jsx: 'automatic' },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/core/test/**/*.test.{ts,tsx}',
      'packages/pro-core/test/**/*.test.{ts,tsx}',
      'packages/ui/test/**/*.test.tsx',
      'packages/ui-vanilla/test/**/*.test.js',
      'packages/pro/test/**/*.test.tsx',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    // React component tests opt into jsdom with a `// @vitest-environment jsdom` docblock.
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // Measured across every package's source, not a hand-picked subset. The previous list
      // named 37 files and reported 96% while the real packages-wide number was 40.55%, so the
      // gate was green against a slice that excluded ui-native, tauri-api, pro-vue, pro-svelte
      // and most of ui and pro. A module with no tests now reports 0% instead of disappearing.
      //
      // apps/** is deliberately out of scope: they are demos and playgrounds with no test suite
      // at all, and including them drops the floor to 21% for a number that says nothing about
      // the shipped libraries. apps/browser-files-viewer additionally carries its own vitest
      // install and lockfile and is excluded from the pnpm workspace.
      include: [
        'packages/*/src/**/*.ts',
        'packages/*/src/**/*.tsx',
        'packages/*/src/**/*.js',
      ],
      // Ratchet floors, not targets. They sit just under the measured 40.16/40.19/41.79/40.55 so
      // an unrelated change cannot silently lower real coverage. Raising one is the point of
      // this gate: when a package gains tests, measure, then raise the floor to the new value
      // in the same commit. Never lower one to land a change.
      //
      // Known gaps, in the order they are worth closing:
      //   packages/ui-native  0%  447 lines, 198 functions, no test directory, no parity check
      //   packages/tauri-api  untested runtime boundary (invoke payloads are not validated)
      //   packages/pro-vue    untested, and diverges from the React prop surface
      //   packages/pro-svelte untested, and diverges from the React prop surface
      //   packages/ui         11 of 33 files measured before; accordion, button, combobox,
      //                       dialog, drawer, dropdown-menu, popover, select, switch, tabs and
      //                       tooltip are still unexercised
      //   packages/pro        pro-crud-page, pro-form-dialog, pro-form-drawer, app-shell,
      //                       pro-layout and use-pro-list are unexercised
      thresholds: {
        statements: 40,
        branches: 39,
        functions: 41,
        lines: 40,
      },
    },
  },
});
