export function getVanillaTemplateFiles(name, options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -p tsconfig.json && vite build',
      preview: 'vite preview',
      ...(options.tauri ? { tauri: 'tauri' } : {}),
    },
    dependencies: {
      ...(options.tauri ? { '@tauri-apps/api': '^2.0.0' } : {}),
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.0',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3',
      vite: '7.3.6',
      ...(options.tauri ? { '@tauri-apps/cli': '2.11.2' } : {}),
    },
  }, null, 2) + '\n');

  files.set('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowJs: true,
      checkJs: false,
      isolatedModules: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
    },
    include: ['src'],
  }, null, 2) + '\n');

  files.set('vite.config.ts', [
    "import tailwindcss from '@tailwindcss/vite';",
    "import { defineConfig } from 'vite';",
    '',
    'export default defineConfig({',
    '  plugins: [tailwindcss()],',
    '});',
    '',
  ].join('\n'));

  const markup = [
    '<main class="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">',
    '  <div class="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">',
    '    <h1 class="text-3xl font-bold tracking-tight">' + name + '</h1>',
    '    <p class="text-slate-400 text-sm">Universal Apps starter powered by browser Custom Elements, TypeScript, Vite, and Tailwind CSS v4.</p>',
    '    <universal-button variant="outline">Get started</universal-button>',
    '  </div>',
    '</main>',
  ].join('\n');

  files.set('src/main.ts', [
    "import './index.css';",
    "import './lib/universal/ui-vanilla/components/ui/button.js';",
    '',
    "const root = document.querySelector<HTMLElement>('#root');",
    "if (!root) throw new Error('Missing #root element');",
    "root.innerHTML = " + JSON.stringify(markup) + ';',
    '',
  ].join('\n'));

  return files;
}
