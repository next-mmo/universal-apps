export function getNativeTemplateFiles(name, _options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -p tsconfig.json && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-native': '^0.81.4',
      'react-native-web': '^0.21.0',
      uniwind: '1.11.0',
      'vite-plugin-rnw': '0.0.12'
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.7.0',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3',
      vite: '7.3.6'
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
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src']
  }, null, 2) + '\n');

  files.set('vite.config.ts', `import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { rnw } from 'vite-plugin-rnw';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [rnw(), react(), tailwindcss()],
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

  files.set('src/App.tsx', `import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <View className="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <Text className="text-3xl font-bold text-slate-50">${name}</Text>
        <Text className="text-slate-400 text-sm">
          Universal Apps starter project powered by React Native Web, Vite, and Tailwind CSS v4.
        </Text>
      </View>
    </View>
  );
}
`);

  return files;
}
