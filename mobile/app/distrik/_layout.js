import { Stack, router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard Distrik',
          headerLeft: ({ canGoBack }) => (
            <TouchableOpacity 
              onPress={() => {
                if (canGoBack) {
                  router.back();
                } else {
                  router.replace('/admin'); 
                }
              }} 
              style={{ marginRight: Platform.OS === 'web' ? 16 : 0, marginLeft: Platform.OS === 'web' ? 16 : 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.black} />
            </TouchableOpacity>
          )
        }} 
      />
      <Stack.Screen name="toko" options={{ title: 'Kelola Toko' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil Bank Sampah' }} />
      <Stack.Screen name="history" options={{ title: 'Riwayat Setoran' }} />
    </Stack>
  );
}
