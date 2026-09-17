import { vitePlugin as inspecto } from '@inspecto-dev/plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async ({ mode }) => ({
  plugins: [
    fumadocsMdx(),
    react(),
    tailwindcss(),
    mode !== 'production' &&
      inspecto({
        pathType: 'absolute',
        include: ['**/*.{js,jsx,ts,tsx}'],
        exclude: ['node_modules/**', 'dist/**'],
      }),
  ].filter(Boolean),
  clearScreen: false,
  server: {
    port: 1430,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
}));
