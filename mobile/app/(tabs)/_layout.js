import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { isDistrik, isAdmin } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg, elevation: 0, shadowOpacity: 0 },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: Colors.green[500],
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home', { defaultValue: 'Beranda' }),
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ziswaf"
          options={{
            title: t('tabs.ziswaf', { defaultValue: 'ZISWAF' }),
            tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="green-point"
          options={{
            title: 'Green Point',
            tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: t('tabs.market', { defaultValue: 'Marketplace' }),
            tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="distrik"
          options={{
            title: 'Distrik',
            tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} />,
            href: (isDistrik() || isAdmin()) ? '/distrik' : null,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile', { defaultValue: 'Profil' }),
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
