export function getExpoTemplateFiles(name, _options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    main: 'index.js',
    scripts: {
      dev: 'expo start',
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
      lint: 'oxlint'
    },
    dependencies: {
      expo: '^57.0.0',
      react: '^19.0.0',
      'react-native': '^0.81.4',
      uniwind: '1.11.0'
    },
    devDependencies: {
      '@expo/metro-config': '^57.0.0',
      'babel-preset-expo': '^57.0.0',
      '@types/react': '^19.0.0',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3'
    }
  }, null, 2) + '\n');

  files.set('metro.config.js', `const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/**
 * Metro configuration for Expo with Uniwind.
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/index.css',
});
`);

  files.set('babel.config.js', `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
`);

  files.set('tsconfig.json', JSON.stringify({
    extends: 'expo/tsconfig.base',
    compilerOptions: {
      strict: true,
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src', 'index.js', 'App.tsx']
  }, null, 2) + '\n');

  files.set('app.json', JSON.stringify({
    expo: {
      name,
      slug: name,
      version: '1.0.0',
      orientation: 'portrait',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true
    }
  }, null, 2) + '\n');

  files.set('index.js', `import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
`);

  files.set('src/index.css', `@import "tailwindcss";
@import "uniwind";

@theme inline {
  --color-primary: #007aff;
  --color-primary-foreground: #ffffff;
  --color-secondary: #2c2c2e;
  --color-secondary-foreground: #f5f5f7;
  --color-destructive: #ff453a;
  --color-destructive-foreground: #ffffff;
  --color-card: #1c1c1e;
  --color-card-foreground: #f5f5f7;
  --color-border: rgba(255, 255, 255, 0.12);
}
`);

  files.set('src/uniwind-env.d.ts', `/// <reference types="uniwind/types" />

export {};
`);

  files.set('src/App.tsx', `import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Uniwind } from 'uniwind';
import './index.css';

export default function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    Uniwind.setTheme(next ? 'dark' : 'light');
  };

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center p-6">
      <View className="max-w-md w-full items-center space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <View className="rounded-full bg-blue-500/10 px-3 py-1 mb-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-blue-400">Expo + Uniwind</Text>
        </View>
        <Text className="text-3xl font-bold text-slate-50 text-center">${name}</Text>
        <Text className="text-slate-400 text-sm text-center leading-relaxed">
          Universal Apps Expo mobile starter powered by Uniwind and Tailwind CSS v4.
        </Text>
        <Pressable
          onPress={toggleTheme}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 active:opacity-80"
        >
          <Text className="font-medium text-white">Toggle Theme ({isDark ? 'Dark' : 'Light'})</Text>
        </Pressable>
      </View>
    </View>
  );
}
`);

  return files;
}
