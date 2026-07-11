import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import GlobalToast from '../components/ui/GlobalToast';
import { useTranslation } from 'react-i18next';
import '../i18n';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
      -webkit-text-fill-color: var(--input-text-color, inherit) !important;
    }
  `;
  document.head.appendChild(style);
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--input-text-color', colors.text);
  }
  
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.bg,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GlobalToast />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: isDark ? Colors.white : Colors.black,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          animation: 'fade_from_bottom', // Kita bisa kembalikan animasi premium yang aman sekarang!
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="distrik" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="bank-sampah" options={{ title: t('bank_sampah.title') + ' ' + t('bank_sampah.title_highlight') }} />
        <Stack.Screen name="dashboard-dampak" options={{ title: t('screens.dashboard_title') }} />
        <Stack.Screen name="reward" options={{ title: t('screens.reward_title') }} />
        <Stack.Screen name="impact-passport" options={{ title: t('screens.passport_title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
        <Stack.Screen name="settings/account" options={{ title: 'Pengaturan Akun' }} />
        <Stack.Screen name="settings/theme" options={{ title: t('settings.theme') }} />
        <Stack.Screen name="ai-scanner" options={{ presentation: 'modal', animation: 'slide_from_bottom', title: t('ai_scanner.title'), headerShown: false }} />
        <Stack.Screen name="eco-ustadz" options={{ presentation: 'modal', animation: 'slide_from_bottom', title: t('eco_ustadz.title'), headerShown: false }} />
        <Stack.Screen name="settings/language" options={{ title: t('settings.language') }} />
        <Stack.Screen name="profile/register-distrik" options={{ title: 'Daftar Distrik' }} />
        <Stack.Screen name="admin/verify-distrik" options={{ title: 'Verifikasi Distrik' }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
