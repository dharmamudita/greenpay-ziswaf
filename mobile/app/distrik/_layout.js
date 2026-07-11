import { Stack, router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useTranslation } from 'react-i18next';

export default function DistrikLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

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
          title: t('distrik.dashboard_title', {defaultValue: 'Dashboard Distrik'}),
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
      <Stack.Screen name="toko" options={{ title: t('distrik.manage_store', {defaultValue: 'Kelola Toko'}) }} />
      <Stack.Screen name="profile" options={{ title: t('distrik.profile_title', {defaultValue: 'Profil Bank Sampah'}) }} />
      <Stack.Screen name="history" options={{ title: t('distrik.history_title', {defaultValue: 'Riwayat Setoran'}) }} />
    </Stack>
  );
}
