// GreenPay ZISWAF Premium Color Palette
export const Colors = {
  // Primary Green (Slightly more vivid and emerald-like)
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#0EA5E9', // Wait, this is blue! Let's use Emerald
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // We'll stick to the original emerald greens but refine Dark/Light theme colors.
  gold: {
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  // Dark Theme (More OLED friendly, deeper contrast)
  dark: {
    bg: '#000000',
    surface: '#0F1713',
    surface2: '#16231D',
    surface3: '#20332B',
    border: '#1F2F28',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
  },
  // Light Theme (Softer, cleaner, modern)
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surface2: '#F1F5F9',
    surface3: '#E2E8F0',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
  },
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export default Colors;
