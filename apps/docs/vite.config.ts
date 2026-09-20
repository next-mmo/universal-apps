import { vitePlugin as inspecto } from '@inspecto-dev/plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig(async ({ mode }) => ({
  plugins: [
    fumadocsMdx(),
    tanstackStart(),
    nitro({
      routeRules: {
        '/previews/**': {
          headers: { 'Access-Control-Allow-Origin': '*' },
        },
      },
    }),
    react(),
    tailwindcss(),
    mode !== 'production' &&
      inspecto({
        pathType: 'absolute',
        include: ['**/*.{js,jsx,ts,tsx}'],
        exclude: ['node_modules/**', 'dist/**'],
      }),
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  clearScreen: false,
  server: {
    port: 1430,
    strictPort: true,
    host: '0.0.0.0',
  },
}));
