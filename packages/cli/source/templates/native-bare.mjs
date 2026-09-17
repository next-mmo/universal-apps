export function getNativeBareTemplateFiles(name, options = {}) {
  const files = new Map();

  files.set('package.json', JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    scripts: {
      dev: 'react-native start',
      start: 'react-native start',
      android: 'react-native run-android',
      ios: 'react-native run-ios',
      lint: 'oxlint'
    },
    dependencies: {
      react: '^19.0.0',
      'react-native': '^0.81.4',
      uniwind: '1.11.0',
      '@babel/runtime': '^7.26.0'
    },
    devDependencies: {
      '@react-native-community/cli': '^20.2.0',
      '@react-native/gradle-plugin': '^0.81.4',
      '@react-native/babel-preset': '^0.81.4',
      '@react-native/metro-config': '^0.81.4',
      '@react-native/typescript-config': '^0.81.4',
      '@types/react': '^19.0.0',
      metro: '^0.81.4',
      tailwindcss: '^4.3.0',
      typescript: '^5.8.3'
    }
  }, null, 2) + '\n');

  files.set('metro.config.js', `const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/**
 * Metro configuration for bare React Native with Uniwind.
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(__dirname), {
  /* custom metro configuration */
});

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/index.css',
});
`);

  files.set('babel.config.js', `module.exports = {
  presets: ['module:@react-native/babel-preset'],
};
`);

  files.set('tsconfig.json', JSON.stringify({
    extends: '@react-native/typescript-config/tsconfig.json',
    compilerOptions: {
      types: [],
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src', 'index.js', 'App.tsx']
  }, null, 2) + '\n');

  files.set('app.json', JSON.stringify({
    name,
    displayName: name
  }, null, 2) + '\n');

  files.set('index.js', `import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
`);

  files.set('src/index.css', `@import "tailwindcss";
@import "uniwind";
`);

  files.set('src/uniwind-env.d.ts', `/// <reference types="uniwind/types" />

export {};
`);

  files.set('src/App.tsx', `import React from 'react';
import { View, Text } from 'react-native';
import './index.css';

export default function App() {
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center p-6">
      <View className="max-w-md w-full items-center space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <Text className="text-3xl font-bold text-slate-50">${name}</Text>
        <Text className="text-slate-400 text-sm text-center">
          Universal Apps bare React Native starter powered by Uniwind and Tailwind CSS v4.
        </Text>
      </View>
    </View>
  );
}
`);

  return files;
}
