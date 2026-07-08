// GreenPay ZISWAF Typography
import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const Typography = {
  fontFamily,
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.15,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export default Typography;
