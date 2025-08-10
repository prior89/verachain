import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const typography = {
  h1: {
    fontFamily: fontFamily?.bold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: fontFamily?.bold,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily: fontFamily?.semibold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: fontFamily?.semibold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h5: {
    fontFamily: fontFamily?.medium,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  body1: {
    fontFamily: fontFamily?.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body2: {
    fontFamily: fontFamily?.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fontFamily?.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  button: {
    fontFamily: fontFamily?.semibold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  buttonSmall: {
    fontFamily: fontFamily?.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
};