export function getSvelteTemplateFiles(name, options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      ...(options.tauri ? { tauri: 'tauri' } : {})
    },
    dependencies: {
      svelte: '^5.39.5',
      'lucide-svelte': '^1.0.1',
      ...(options.tauri ? { '@tauri-apps/api': '^2.0.0' } : {})
    },
    devDependencies: {
      '@sveltejs/vite-plugin-svelte': '^6.2.1',
      '@tailwindcss/vite': '^4.3.0',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3',
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
      isolatedModules: true,
      skipLibCheck: true,
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src/**/*.ts', 'src/**/*.svelte']
  }, null, 2) + '\n');

  files.set('vite.config.ts', `import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`);

  files.set('src/main.ts', `import { mount } from 'svelte';
import App from './App.svelte';
import './index.css';

const app = mount(App, { target: document.getElementById('root')! });
export default app;
`);

  files.set('src/App.svelte', `<main class="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
  <div class="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
    <h1 class="text-3xl font-bold tracking-tight">${name}</h1>
    <p class="text-slate-400 text-sm">
      Universal Apps starter project powered by Svelte 5, Vite, and Tailwind CSS v4.
    </p>
  </div>
</main>
`);

  return files;
}
