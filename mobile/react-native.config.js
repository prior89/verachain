module.exports = {
  project: {
    ios: {},
    android: {
      sourceDir: './android',
      appName: 'VeraChainMobile',
    },
  },
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          xcodeprojPath: 'ios/VeraChainMobile.xcodeproj',
          plistPath: 'ios/VeraChainMobile/Info.plist',
        },
      },
    },
  },
  assets: ['./assets/fonts/'],
};