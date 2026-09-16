export function getReactTemplateFiles(name, options = {}) {
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
      ...(options.tauri ? { tauri: 'tauri' } : {})
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'lucide-react': '^1.0.0',
      ...(options.tauri ? { '@tauri-apps/api': '^2.0.0' } : {})
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.7.0',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3',
      vite: '7.3.6',
      ...(options.tauri ? { '@tauri-apps/cli': '2.11.2' } : {})
    }
  }, null, 2) + '\n');

  files.set('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src']
  }, null, 2) + '\n');

  files.set('vite.config.ts', `import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`);

  files.set('src/main.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

  files.set('src/App.tsx', `export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">${name}</h1>
        <p className="text-slate-400 text-sm">
          Universal Apps starter project powered by React, Vite, and Tailwind CSS v4.
        </p>
      </div>
    </main>
  );
}
`);

  return files;
}
