import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: '/previews/svelte/',
  plugins: [svelte(), tailwindcss()],
  build: {
    outDir: path.resolve(root, '../../public/previews/svelte'),
    emptyOutDir: true,
  },
});
