import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    perf: 'warn',
  },
  plugins: ['react', 'react-perf', 'jsx-a11y', 'typescript', 'vitest'],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.nd-workflow-adoption/**',
    // Generated into the project by the tauri-universal source CLI; tracked by universal.lock.json.
    'src/lib/universal/**',
  ],
});
