const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: {
      '@kleroai/react-native': root,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
