import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
  const { colors } = useTheme();

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
          title: 'Dashboard Admin',
          headerTitleAlign: 'center'
        }} 
      />
      <Stack.Screen 
        name="distrik" 
        options={{ 
          title: 'Verifikasi Setoran',
          headerTitleAlign: 'center',
          headerShown: false
        }} 
      />
    </Stack>
  );
}
