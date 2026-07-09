import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import GlobalToast from '../components/ui/GlobalToast';
import '../i18n';

function AppContent() {
  const { colors, isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GlobalToast />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: isDark ? Colors.white : Colors.black,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="bank-sampah" options={{ title: 'Bank Sampah' }} />
        <Stack.Screen name="dashboard-dampak" options={{ title: 'Dashboard Dampak' }} />
        <Stack.Screen name="reward" options={{ title: 'Reward' }} />
        <Stack.Screen name="impact-passport" options={{ title: 'Impact Passport' }} />
        <Stack.Screen name="settings" options={{ title: 'Pengaturan' }} />
      </Stack>
    </>
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
