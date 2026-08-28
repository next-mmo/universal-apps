import tailwindcss from '@tailwindcss/vite';
import { uniwind } from 'uniwind/vite';
import { rnw } from 'vite-plugin-rnw';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    rnw(),
    tailwindcss(),
    uniwind({
      cssEntryFile: './src/index.css',
      dtsFile: './src/uniwind.d.ts',
    }),
  ],
  server: {
    port: 1453,
  },
});
