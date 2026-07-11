import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';

export default function DistrikLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: isDark ? Colors.white : Colors.black,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard Distrik' }} />
      <Stack.Screen name="reward" options={{ title: 'Verifikasi Reward' }} />
      <Stack.Screen name="toko" options={{ title: 'Kelola Toko' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil Bank Sampah' }} />
      <Stack.Screen name="history" options={{ title: 'Riwayat Setoran' }} />
    </Stack>
  );
}
