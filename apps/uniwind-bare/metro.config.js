const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration for bare React Native with Uniwind.
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(projectRoot), {
  watchFolders: [
    path.resolve(monorepoRoot, 'packages'),
    path.resolve(monorepoRoot, 'node_modules'),
  ],
  resolver: {
    blockList: [/.*\/apps\/(?!uniwind-bare).*/, /.*\.vite.*/],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
});

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/index.css',
});
