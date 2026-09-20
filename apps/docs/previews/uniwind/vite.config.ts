import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import { rnw } from 'vite-plugin-rnw';
import { uniwind } from 'uniwind/vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: '/previews/uniwind/',
  plugins: [
    rnw(),
    tailwindcss(),
    uniwind({
      cssEntryFile: path.resolve(root, 'src/index.css'),
      dtsFile: path.resolve(root, 'src/uniwind.d.ts'),
    }),
  ],
  build: {
    outDir: path.resolve(root, '../../public/previews/uniwind'),
    emptyOutDir: true,
  },
});
