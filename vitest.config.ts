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
      'packages/pro/test/**/*.test.tsx',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    // React component tests opt into jsdom with a `// @vitest-environment jsdom` docblock.
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // Files in scope are listed explicitly so a module with no tests reports 0% instead of
      // disappearing from the report. Widen this list as each remaining package gains tests:
      // packages/{ui,pro,ui-native,pro-vue,pro-svelte,tauri-api} are still outside it.
      include: [
        'packages/core/src/**/*.ts',
        'packages/pro-core/src/**/*.ts',
        'packages/pro/src/access/**/*.tsx',
        'packages/pro/src/descriptions/pro-descriptions.tsx',
        'packages/pro/src/form/pro-form.tsx',
        'packages/pro/src/form/pro-step-form.tsx',
        'packages/pro/src/layout/app-frame.tsx',
        'packages/pro/src/layout/page-container.tsx',
        'packages/pro/src/layout/pro-error-boundary.tsx',
        'packages/pro/src/tabs/pro-tabs.tsx',
        'packages/pro/src/table/editable-pro-table.tsx',
        'packages/pro/src/table/pro-filter-toolbar.tsx',
        'packages/pro/src/data-table/columns.tsx',
        'packages/pro/src/data-table/data-table-pagination.tsx',
        'packages/pro/src/data-table/data-table-toolbar.tsx',
        'packages/pro/src/data-table/pro-data-table.tsx',
        'packages/pro/src/data-table/pro-table-features.ts',
        'packages/ui/src/components/ui/avatar.tsx',
        'packages/ui/src/components/ui/calendar.tsx',
        'packages/ui/src/components/ui/date-picker.tsx',
        'packages/ui/src/components/ui/table.tsx',
        'packages/ui/src/components/ui/toast.tsx',
        'packages/ui/src/components/ui/toggle.tsx',
        'packages/ui/src/components/ui/toggle-group.tsx',
        'packages/ui/src/lib/cn.ts',
      ],
      // Floors, not targets. Raise them as coverage grows; never lower one to land a change.
      // Still outside this list, and therefore unmeasured: the remaining ui and pro components
      // (command, combobox, animated-tabs, pro-layout, pro-crud-page, app-shell), ui-native,
      // pro-vue, pro-svelte, and tauri-api.
      thresholds: {
        statements: 94,
        branches: 87,
        functions: 93,
        lines: 96,
      },
    },
  },
});
