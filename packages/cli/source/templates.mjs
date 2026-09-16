import path from 'node:path';

export function getTemplateFiles(name, options = {}) {
  const framework = options.framework ?? 'react';
  const isTauri = !!options.tauri;
  const pm = options.packageManager ?? 'npm';
  const crateName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const libName = crateName + '_lib';
  const safeIdent = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const files = new Map();

  // Shared index.html
  const mainScript = framework === 'react' || framework === 'native' ? '/src/main.tsx' : '/src/main.ts';
  files.set('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${mainScript}"></script>
  </body>
</html>
`);

  // Shared index.css
  files.set('src/index.css', `@import "tailwindcss";
`);

  if (framework === 'react') {
    files.set('package.json', JSON.stringify({
      name,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc -p tsconfig.json && vite build',
        preview: 'vite preview',
        ...(isTauri ? { tauri: 'tauri' } : {})
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'lucide-react': '^1.0.0',
        ...(isTauri ? { '@tauri-apps/api': '^2.0.0' } : {})
      },
      devDependencies: {
        '@tailwindcss/vite': '^4.3.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        '@vitejs/plugin-react': '^4.7.0',
        tailwindcss: '^4.3.0',
        typescript: '^5.8.3',
        vite: '7.3.6',
        ...(isTauri ? { '@tauri-apps/cli': '2.11.2' } : {})
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
  } else if (framework === 'vue') {
    files.set('package.json', JSON.stringify({
      name,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vue-tsc --noEmit && vite build',
        preview: 'vite preview',
        ...(isTauri ? { tauri: 'tauri' } : {})
      },
      dependencies: {
        vue: '^3.5.22',
        'lucide-vue-next': '^1.0.0',
        ...(isTauri ? { '@tauri-apps/api': '^2.0.0' } : {})
      },
      devDependencies: {
        '@tailwindcss/vite': '^4.3.0',
        '@vitejs/plugin-vue': '^6.0.3',
        tailwindcss: '^4.3.0',
        typescript: '^5.8.3',
        'vue-tsc': '^2.2.0',
        vite: '7.3.6',
        ...(isTauri ? { '@tauri-apps/cli': '2.11.2' } : {})
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
  } else if (framework === 'svelte') {
    files.set('package.json', JSON.stringify({
      name,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        ...(isTauri ? { tauri: 'tauri' } : {})
      },
      dependencies: {
        svelte: '^5.39.5',
        'lucide-svelte': '^1.0.1',
        ...(isTauri ? { '@tauri-apps/api': '^2.0.0' } : {})
      },
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '^6.2.1',
        '@tailwindcss/vite': '^4.3.0',
        tailwindcss: '^4.3.0',
        typescript: '^5.8.3',
        vite: '7.3.6',
        ...(isTauri ? { '@tauri-apps/cli': '2.11.2' } : {})
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
  } else if (framework === 'native') {
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
  }

  // If --tauri requested
  if (isTauri) {
    files.set('src-tauri/Cargo.toml', `[package]
name = "${crateName}"
version = "0.1.0"
description = "A Tauri App"
authors = [""]
edition = "2021"

[lib]
name = "${libName}"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`);

    files.set('src-tauri/build.rs', `fn main() {
    tauri_build::build()
}
`);

    files.set('src-tauri/src/main.rs', `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ${libName}::run()
}
`);

    files.set('src-tauri/src/lib.rs', `#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`);

    files.set('src-tauri/capabilities/default.json', JSON.stringify({
      $schema: '../gen/schemas/desktop-schema.json',
      identifier: 'default',
      description: 'Capability for the main window',
      windows: ['main'],
      permissions: ['core:default', 'opener:default']
    }, null, 2) + '\n');

    files.set('src-tauri/tauri.conf.json', JSON.stringify({
      $schema: 'https://schema.tauri.app/config/2',
      productName: name,
      version: '0.1.0',
      identifier: `com.${safeIdent || 'app'}.app`,
      build: {
        beforeDevCommand: `${pm} run dev`,
        beforeBuildCommand: `${pm} run build`,
        devUrl: 'http://localhost:5173',
        frontendDist: '../dist'
      },
      app: {
        windows: [
          {
            title: name,
            width: 1024,
            height: 768
          }
        ],
        security: {
          csp: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: asset:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost"
        }
      },
      bundle: {
        active: true,
        targets: 'all'
      }
    }, null, 2) + '\n');
  }

  return files;
}
