export function getVueTemplateFiles(name, options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vue-tsc --noEmit && vite build',
      preview: 'vite preview',
      ...(options.tauri ? { tauri: 'tauri' } : {})
    },
    dependencies: {
      vue: '^3.5.22',
      'lucide-vue-next': '^1.0.0',
      ...(options.tauri ? { '@tauri-apps/api': '^2.0.0' } : {})
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.0',
      '@vitejs/plugin-vue': '^6.0.3',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3',
      'vue-tsc': '^2.2.0',
      vite: '7.3.6',
      ...(options.tauri ? { '@tauri-apps/cli': '2.11.2' } : {})
    }
  }, null, 2) + '\n');

  files.set('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      jsx: 'preserve',
      resolveJsonModule: true,
      isolatedModules: true,
      skipLibCheck: true,
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue']
  }, null, 2) + '\n');

  files.set('vite.config.ts', `import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`);

  files.set('src/vite-env.d.ts', `/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
`);

  files.set('src/main.ts', `import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#root');
`);

  files.set('src/App.vue', `<script setup lang="ts">
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
    <div class="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
      <h1 class="text-3xl font-bold tracking-tight">${name}</h1>
      <p class="text-slate-400 text-sm">
        Universal Apps starter project powered by Vue 3, Vite, and Tailwind CSS v4.
      </p>
    </div>
  </main>
</template>
`);

  return files;
}
