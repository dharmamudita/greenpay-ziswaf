import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      <LinearGradient 
        colors={[isDark ? Colors.dark.surface2 : Colors.green[50], colors.bg]} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <View style={dynamicStyles.header}>
            <View style={[dynamicStyles.logoWrap, Shadows.md]}>
              <LinearGradient
                colors={[Colors.green[400], Colors.green[600]]}
                style={dynamicStyles.logo}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="leaf" size={40} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={dynamicStyles.title}>{t('auth.welcome_back')}</Text>
            <Text style={dynamicStyles.subtitle}>{t('auth.login_desc')} <Text style={{ color: Colors.green[500], fontWeight: '700' }}>GreenPay ZISWAF</Text></Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={dynamicStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#F87171" />
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={[dynamicStyles.formCard, Shadows.md]}>
            <View style={dynamicStyles.form}>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>{t('auth.email')}</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
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
                <Text style={dynamicStyles.label}>{t('auth.password')}</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                  <TextInput
                    style={[dynamicStyles.input, { flex: 1 }]}
                    placeholder="Masukkan password Anda"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Button title={t('auth.login')} onPress={handleLogin} loading={loading} style={{ marginTop: Spacing.md }} />
            </View>
          </View>

          <View style={[dynamicStyles.footer, { flexDirection: 'column', alignItems: 'center', gap: Spacing.md }]}>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={[dynamicStyles.footerText, { color: Colors.green[500] }]}>{t('auth.forgot_pwd')}</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.footerText}>{t('auth.no_account').split('?')[0]}? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={dynamicStyles.linkText}>{t('auth.register')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingTop: height * 0.1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoWrap: {
    borderRadius: BorderRadius['2xl'],
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA',
  },
  errorText: {
    color: isDark ? '#FCA5A5' : '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.bg : Colors.gray[50],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: isDark ? colors.border : Colors.gray[200],
  },
  inputIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    color: Colors.green[500],
    fontSize: 15,
    fontWeight: '800',
  },
});
