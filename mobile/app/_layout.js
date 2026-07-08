import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import Colors from '../theme/colors';

// Polyfill DOMException untuk Hermes Engine di React Native
if (typeof globalThis.DOMException === "undefined") {
  class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name;
    }
  }
  globalThis.DOMException = DOMException;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.dark.bg },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.dark.bg },
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
      </Stack>
    </AuthProvider>
  );
}
