import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { isDistrik, isAdmin } = useAuth();
  
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark.bg, elevation: 0, shadowOpacity: 0 },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: Colors.dark.surface,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: Colors.green[400],
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ziswaf"
        options={{
          title: 'ZISWAF',
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
          title: 'Marketplace',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="distrik"
        options={{
          title: 'Distrik',
          tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} />,
          // Sembunyikan tab ini dari navigasi bawah jika role BUKAN distrik/admin
          href: (isDistrik() || isAdmin()) ? '/distrik' : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
