import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password harus diisi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal masuk. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={dynamicStyles.header}>
          <LinearGradient
            colors={[Colors.green[600], Colors.green[500]]}
            style={dynamicStyles.logo}
          >
            <Ionicons name="leaf" size={32} color={Colors.white} />
          </LinearGradient>
          <Text style={dynamicStyles.title}>Selamat Datang</Text>
          <Text style={dynamicStyles.subtitle}>Masuk ke GreenPay ZISWAF</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={dynamicStyles.errorBox}>
            <Text style={dynamicStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={dynamicStyles.form}>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Email</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput
                style={dynamicStyles.input}
                placeholder="nama@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Password</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput
                style={[dynamicStyles.input, { flex: 1 }]}
                placeholder="Masukkan password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <Button title="Masuk" onPress={handleLogin} loading={loading} />

          <View style={dynamicStyles.footer}>
            <Text style={dynamicStyles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={dynamicStyles.linkText}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
  },
  form: {
    gap: Spacing.base,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  eyeBtn: {
    padding: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: Colors.green[500],
    fontSize: 14,
    fontWeight: '700',
  },
});
