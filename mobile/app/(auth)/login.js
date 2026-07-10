import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import api from '../../services/api';
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
  const { setAuthState } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Konfigurasi Auth Session
  // Ganti dengan Client ID asli Anda dari Google/Meta Developer Console
  const GOOGLE_CLIENT_ID = '863588088837-9t2av69r05o3dg1f02gfenrf2htu5j4h.apps.googleusercontent.com';
  const FB_CLIENT_ID = 'MASUKKAN_FB_CLIENT_ID_ANDA_DISINI';

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FB_CLIENT_ID,
  });

  // Effect untuk mendengarkan hasil dari Google Login
  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleSocialLogin('google', authentication.accessToken);
    }
  }, [googleResponse]);

  // Effect untuk mendengarkan hasil dari Facebook Login
  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleSocialLogin('facebook', authentication.accessToken);
    }
  }, [fbResponse]);

  const dynamicStyles = getStyles(colors, isDark);

  const handleSocialLogin = async (provider, token) => {
    setLoading(true);
    setError('');
    try {
      // 1. Ambil data profil dari provider
      let email = '';
      let name = '';
      
      if (provider === 'google') {
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfo = await userInfoResponse.json();
        email = userInfo.email;
        name = userInfo.name;
      } else if (provider === 'facebook') {
        const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`);
        const userInfo = await userInfoResponse.json();
        email = userInfo.email;
        name = userInfo.name;
      }

      // 2. Kirim ke backend
      const res = await api.post('/auth/social-login', { provider, token, email, name });
      
      if (res.data.isNewUser) {
        // Arahkan ke halaman lengkapi profil
        router.push({
          pathname: '/(auth)/complete-profile',
          params: { email: res.data.email, name: res.data.name }
        });
      } else {
        // Langsung login
        await setAuthState(res.data.token, res.data.user);
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError(err.response?.data?.error || `Gagal login dengan ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

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
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={dynamicStyles.logo}
                resizeMode="cover"
              />
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
              
              <View style={dynamicStyles.dividerContainer}>
                <View style={dynamicStyles.dividerLine} />
                <Text style={dynamicStyles.dividerText}>atau</Text>
                <View style={dynamicStyles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={dynamicStyles.socialBtn} 
                onPress={() => {
                  if (GOOGLE_CLIENT_ID.includes('MASUKKAN')) {
                    setError('Google Client ID belum diatur di kode.');
                    return;
                  }
                  googlePromptAsync();
                }}
                disabled={!googleRequest || loading}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={dynamicStyles.socialBtnText}>Lanjutkan dengan Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={dynamicStyles.socialBtn} 
                onPress={() => {
                  if (FB_CLIENT_ID.includes('MASUKKAN')) {
                    setError('Facebook Client ID belum diatur di kode.');
                    return;
                  }
                  fbPromptAsync();
                }}
                disabled={!fbRequest || loading}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text style={dynamicStyles.socialBtnText}>Lanjutkan dengan Facebook</Text>
              </TouchableOpacity>
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
    padding: Spacing.xl,
    paddingTop: height * 0.1,
    paddingBottom: 100, // Memberikan ruang scroll ekstra saat keyboard terbuka
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  }
});
