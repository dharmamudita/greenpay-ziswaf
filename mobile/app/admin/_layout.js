import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: t('admin.dashboard_title', {defaultValue: 'Dashboard Admin'}),
          headerTitleAlign: 'center'
        }} 
      />
      <Stack.Screen 
        name="distrik" 
        options={{ 
          title: t('admin.deposit_title', {defaultValue: 'Setoran Sampah'})
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: t('admin.users_title', {defaultValue: 'Data Pengguna'})
        }} 
      />
      <Stack.Screen 
        name="verify-distrik" 
        options={{ 
          title: t('admin.verify_distrik_title', {defaultValue: 'Verifikasi Distrik'})
        }} 
      />
      <Stack.Screen 
        name="ziswaf" 
        options={{ 
          title: t('admin.ziswaf_title', {defaultValue: 'Manajemen ZISWAF'})
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: t('admin.notifications_title', {defaultValue: 'Pusat Informasi'})
        }} 
      />
    </Stack>
  );
}
