import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: '/previews/vue/',
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: path.resolve(root, '../../public/previews/vue'),
    emptyOutDir: true,
  },
});
