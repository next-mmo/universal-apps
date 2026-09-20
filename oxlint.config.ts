import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    // Correctness is a gate: a real defect must fail the build rather than scroll past as a warning.
    correctness: 'error',
    // Performance hints stay advisory until the component set is memoized deliberately; most are the
    // same "inline function as prop" suggestion, and blocking on them would stall delivery.
    perf: 'warn',
  },
  plugins: ['react', 'react-perf', 'jsx-a11y', 'jsdoc', 'vitest', 'typescript'],
  rules: {
    // `@agent-quickstart` marks the doc-comment examples that the source-distribution scanner must
    // skip when it looks for lingering workspace imports, so it is a real tag in this repository.
    'jsdoc/check-tag-names': ['error', { definedTags: ['agent-quickstart'] }],
    // Advisory: each of these needs a product/design decision plus a browser check, so they are
    // reported on every run without blocking. `role="status"` in particular is correct ARIA for a
    // loading region, and autofocus is deliberate in the command palette and the todo composer.
    'jsx-a11y/prefer-tag-over-role': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/control-has-associated-label': 'warn',
  },
  // The ND Workflow reference apps are self-contained teaching projects with their own checks; their
  // HTML calls the browser globals that oxlint otherwise reports as unused functions. Benchmarks
  // under results/ are archived run artifacts, not maintained source.
  ignorePatterns: [
    'packages/nd-workflow/example/**',
    'apps/benchmark/results/**',
    'dist/**',
  ],
});
