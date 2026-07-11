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
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import api from '../../services/api';
import authService from '../../services/authService';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthState } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  React.useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('saved_email');
        const savedPassword = await SecureStore.getItemAsync('saved_password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
        }
      } catch (err) {
        console.log('Error loading credentials', err);
      }
    };
    loadCredentials();
  }, []);

  const GOOGLE_CLIENT_ID = '863588088837-9t2av69r05o3dg1f02gfenrf2htu5j4h.apps.googleusercontent.com';
  const FB_CLIENT_ID = '1035461415601809';

  const redirectUri = makeRedirectUri({ preferLocalhost: true });
  console.log('REDIRECT_URI:', redirectUri);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FB_CLIENT_ID,
    redirectUri,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleSocialLogin('google', authentication.accessToken);
    }
  }, [googleResponse]);

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

      const res = await api.post('/auth/social-login', { provider, token, email, name });
      
      if (res.data.isNewUser) {
        router.push({
          pathname: '/(auth)/complete-profile',
          params: { email: res.data.email, name: res.data.name }
        });
      } else {
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
      const data = await authService.login(email.trim().toLowerCase(), password);
      
      // Save credentials for auto-fill on next login
      try {
        await SecureStore.setItemAsync('saved_email', email.trim().toLowerCase());
        await SecureStore.setItemAsync('saved_password', password);
      } catch (e) {
        console.log('Could not save credentials', e);
      }

      await setAuthState(data.token, data.user);
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
        colors={[isDark ? Colors.green[900] : Colors.green[50], colors.bg]} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.logoGlow}>
              <View style={[dynamicStyles.logoWrap, Shadows.md]}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={dynamicStyles.logo}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text style={dynamicStyles.title}>{t('auth.welcome_back')}</Text>
            <Text style={dynamicStyles.subtitle}>{t('auth.login_desc')} <Text style={{ color: Colors.green[500], fontWeight: '800' }}>GreenPay ZISWAF</Text></Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={dynamicStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#F87171" />
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Card (Glassmorphism look) */}
          <View style={[dynamicStyles.formCard, Shadows.lg]}>
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

              <View style={dynamicStyles.forgotPwdWrap}>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={dynamicStyles.forgotPwdText}>{t('auth.forgot_pwd')}</Text>
                </TouchableOpacity>
              </View>

              <Button title={t('auth.login')} onPress={handleLogin} loading={loading} style={dynamicStyles.loginBtn} />
              
              <View style={dynamicStyles.dividerContainer}>
                <View style={dynamicStyles.dividerLine} />
                <Text style={dynamicStyles.dividerText}>ATAU MASUK DENGAN</Text>
                <View style={dynamicStyles.dividerLine} />
              </View>

              <View style={dynamicStyles.socialContainer}>
                <TouchableOpacity 
                  style={dynamicStyles.socialBtnPill} 
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
                  <Text style={dynamicStyles.socialBtnText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.socialBtnPill} 
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
                  <Text style={dynamicStyles.socialBtnText}>Facebook</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>

          <View style={dynamicStyles.footer}>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    marginBottom: Spacing.xl,
  },
  logoWrap: {
    borderRadius: BorderRadius['2xl'],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
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
    fontWeight: '600',
    flex: 1,
  },
  
  formCard: {
    backgroundColor: isDark ? 'rgba(30,41,59,0.7)' : colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : Colors.gray[100],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
  },
  inputIcon: {
    paddingLeft: Spacing.md,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.md,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: Spacing.md,
  },
  
  forgotPwdWrap: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPwdText: {
    color: Colors.green[500],
    fontSize: 13,
    fontWeight: '700',
  },
  
  loginBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  socialBtnPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.white,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
    shadowOpacity: isDark ? 0 : 0.05,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
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
  }
});
