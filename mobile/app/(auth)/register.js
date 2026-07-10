import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Modal, SafeAreaView, Image } from 'react-native';
import Recaptcha from 'react-native-recaptcha-that-works';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../../services/api';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(ROLES.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const [isSkVisible, setSkVisible] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  
  const { setAuthState, register } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  const recaptchaRef = useRef(null);
  
  const GOOGLE_CLIENT_ID = '863588088837-9t2av69r05o3dg1f02gfenrf2htu5j4h.apps.googleusercontent.com';
  const FB_CLIENT_ID = '1035461415601809';

  const redirectUri = makeRedirectUri({ preferLocalhost: true });

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
      handleSocialLogin('google', googleResponse.authentication.accessToken);
    }
  }, [googleResponse]);

  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      handleSocialLogin('facebook', fbResponse.authentication.accessToken);
    }
  }, [fbResponse]);

  const handleSocialLogin = async (provider, token) => {
    setLoading(true);
    setError('');
    try {
      let email = '';
      let name = '';
      
      if (provider === 'google') {
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${token}` } });
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

  const dynamicStyles = getStyles(colors, isDark);

  const validateAndShowSK = () => {
    if (!name || !email || !password) {
      setError('Semua field harus diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    
    setError('');
    setSkVisible(true);
    setIsScrolledToBottom(false);
  };

  const triggerCaptcha = () => {
    setSkVisible(false);
    if (Platform.OS === 'web') {
      executeRegister('bypass-for-web');
    } else {
      setTimeout(() => {
        if (recaptchaRef.current) {
          recaptchaRef.current.open();
        }
      }, 1000);
    }
  };

  const executeRegister = async (captchaToken) => {
    setLoading(true);
    try {
      const baseUrl = api.defaults.baseURL;
      const res = await fetch(`${baseUrl}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: 'register', captchaToken })
      });
      
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch(e) {}
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      
      setOtpVisible(true);
    } catch (err) {
      setError(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setError('OTP harus 6 digit.');
    setLoadingOtp(true);
    setError('');
    try {
      const baseUrl = api.defaults.baseURL;
      const res = await fetch(`${baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp, type: 'register' })
      });
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch(e) {}
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      
      await register(email.trim().toLowerCase(), password, name, role);
      setOtpVisible(false);
      router.replace('/(tabs)');
    } catch (err) {
      setError(`Gagal verifikasi: ${err.message}`);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleScrollSK = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setIsScrolledToBottom(true);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      <LinearGradient 
        colors={[isDark ? Colors.green[900] : Colors.green[50], colors.bg]} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
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
            <Text style={dynamicStyles.title}>{t('auth.join_us')}</Text>
            <Text style={dynamicStyles.subtitle}>{t('auth.register_desc')}</Text>
          </View>

          {error ? (
            <View style={dynamicStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#F87171" />
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={[dynamicStyles.formCard, Shadows.lg]}>
            <View style={dynamicStyles.form}>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>{t('auth.fullname')}</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                  <TextInput style={dynamicStyles.input} placeholder="Masukkan nama" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
                </View>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>{t('auth.email')}</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                  <TextInput style={dynamicStyles.input} placeholder="nama@email.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>{t('auth.password')}</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                  <TextInput style={[dynamicStyles.input, { flex: 1 }]} placeholder="Min. 6 karakter" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Konfirmasi Password</Text>
                <View style={dynamicStyles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                  <TextInput style={dynamicStyles.input} placeholder="Ulangi password" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                </View>
              </View>

              <Button 
                title={t('auth.register')} 
                onPress={validateAndShowSK} 
                loading={loading} 
                style={dynamicStyles.loginBtn} 
              />
              
              <View style={dynamicStyles.dividerContainer}>
                <View style={dynamicStyles.dividerLine} />
                <Text style={dynamicStyles.dividerText}>ATAU DAFTAR DENGAN</Text>
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
            <Text style={dynamicStyles.footerPolicy}>Dengan mendaftar Anda setuju dengan S&K.</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.footerText}>{t('auth.have_account').split('?')[0]}? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={dynamicStyles.linkText}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>

      {/* Modal Syarat & Ketentuan - Polished UI */}
      <Modal visible={isSkVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSkVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          
          <View style={dynamicStyles.modalHeader}>
            <TouchableOpacity onPress={() => setSkVisible(false)} style={dynamicStyles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={dynamicStyles.modalTitle}>Syarat & Ketentuan</Text>
          </View>

          <ScrollView 
            style={{ flex: 1, padding: Spacing.xl }} 
            onScroll={handleScrollSK} 
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            <Text style={dynamicStyles.skHeroTitle}>Perjanjian Pengguna</Text>
            <Text style={dynamicStyles.skSubTitle}>GreenPay ZISWAF</Text>
            
            <Text style={dynamicStyles.skText}>
              Selamat datang di GreenPay ZISWAF. Dengan mendaftar dan menggunakan aplikasi ini, Anda setuju untuk terikat dengan syarat dan ketentuan berikut:
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>1. Penggunaan Layanan</Text>{'\n'}
              Aplikasi ini dirancang untuk memfasilitasi transaksi bank sampah dan pembayaran ZISWAF (Zakat, Infaq, Sadaqah, Wakaf). Anda dilarang keras menggunakan aplikasi ini untuk kegiatan ilegal atau penipuan finansial.
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>2. Akurasi Data</Text>{'\n'}
              Anda berjanji untuk memberikan informasi yang akurat saat pendaftaran. Kami berhak menangguhkan akun jika ditemukan data palsu.
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>3. Transaksi & Saldo</Text>{'\n'}
              Green Point yang Anda dapatkan dari bank sampah dapat digunakan untuk donasi ZISWAF. Saldo tidak dapat ditukar menjadi uang tunai (fiat) melainkan hanya untuk ekosistem amal di dalam aplikasi.
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>4. Privasi & Keamanan</Text>{'\n'}
              Kami menjaga kerahasiaan data Anda dengan standar enkripsi tinggi. Namun, Anda bertanggung jawab penuh atas kerahasiaan kata sandi Anda. Jangan berikan akses ke pihak ketiga.
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>5. Perubahan Ketentuan</Text>{'\n'}
              Pihak pengembang berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Pengguna diharapkan memeriksa halaman ini secara berkala.
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>6. Penolakan Tanggung Jawab (Disclaimer)</Text>{'\n'}
              Kami tidak bertanggung jawab atas kerugian tidak langsung yang diakibatkan oleh gangguan jaringan, *maintenance* server, atau hal tak terduga (*force majeure*).
              {'\n\n'}
              <Text style={dynamicStyles.skBold}>7. Hukum yang Berlaku</Text>{'\n'}
              Semua sengketa yang berkaitan dengan aplikasi ini akan diselesaikan berdasarkan asas musyawarah dan hukum yang berlaku di Republik Indonesia.
              {'\n\n'}
              <Text style={{ color: Colors.green[500], fontStyle: 'italic', fontWeight: 'bold' }}>
                (Silakan terus scroll hingga ke bagian paling bawah untuk mengaktifkan tombol persetujuan).
              </Text>
              {'\n\n\n\n'}
            </Text>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity 
              style={[
                dynamicStyles.skBtn, 
                { backgroundColor: isScrolledToBottom ? Colors.green[600] : (isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[200]) }
              ]} 
              onPress={triggerCaptcha} 
              disabled={!isScrolledToBottom}
              activeOpacity={0.8}
            >
              <Text style={[dynamicStyles.skBtnText, { color: isScrolledToBottom ? Colors.white : colors.textMuted }]}>
                {isScrolledToBottom ? 'Saya Setuju & Daftar' : 'Scroll ke bawah untuk setuju'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {Platform.OS !== 'web' && (
        <Recaptcha
          ref={recaptchaRef}
          siteKey="6LfRukwtAAAAAO5s5EuQ7ZcVrfpdQICSfC-JTUCs"
          baseUrl="https://google.com"
          onVerify={executeRegister}
          onExpire={() => setError('CAPTCHA kedaluwarsa. Silakan coba lagi.')}
          size="normal"
        />
      )}

      {/* Modal Verifikasi OTP - Premium Vault Style */}
      <Modal visible={otpVisible} animationType="fade" transparent={true} onRequestClose={() => setOtpVisible(false)}>
        <View style={dynamicStyles.otpOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            
            <View style={[dynamicStyles.otpCard, Shadows.lg]}>
              <View style={dynamicStyles.otpIconRing}>
                <Ionicons name="shield-checkmark" size={32} color={Colors.green[500]} />
              </View>
              
              <Text style={dynamicStyles.otpTitle}>Verifikasi Keamanan</Text>
              <Text style={dynamicStyles.otpDesc}>
                Masukkan 6-digit kode unik yang telah dikirim ke{'\n'}
                <Text style={dynamicStyles.otpEmail}>{email}</Text>
              </Text>

              {error ? (
                <Text style={dynamicStyles.otpError}>{error}</Text>
              ) : null}

              <View style={dynamicStyles.otpVaultInputWrap}>
                <TextInput 
                  style={dynamicStyles.otpVaultInput} 
                  placeholder="------" 
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 
                  value={otp} 
                  onChangeText={setOtp} 
                  keyboardType="number-pad" 
                  maxLength={6}
                />
              </View>

              <Button title="Buka & Daftar" onPress={handleVerifyOtp} loading={loadingOtp} style={{ width: '100%', marginBottom: Spacing.lg }} />
              
              <TouchableOpacity onPress={() => setOtpVisible(false)} disabled={loadingOtp}>
                <Text style={dynamicStyles.otpCancelText}>Batal</Text>
              </TouchableOpacity>
            </View>

          </KeyboardAvoidingView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoGlow: { padding: 10, borderRadius: 50, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', marginBottom: Spacing.xl },
  logoWrap: { borderRadius: BorderRadius['2xl'] },
  logo: { width: 72, height: 72, borderRadius: BorderRadius['2xl'] },
  title: { fontSize: 32, fontWeight: '900', color: colors.text, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
  
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA' },
  errorText: { color: isDark ? '#FCA5A5' : '#EF4444', fontSize: 13, fontWeight: '600', flex: 1 },
  
  formCard: { backgroundColor: isDark ? 'rgba(30,41,59,0.7)' : colors.surface, padding: Spacing.xl, borderRadius: BorderRadius['2xl'], borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: 13, fontWeight: '800', color: colors.text, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : Colors.gray[100], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' },
  inputIcon: { paddingLeft: Spacing.md, opacity: 0.7 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: Spacing.md + 4, paddingHorizontal: Spacing.md, fontWeight: '600' },
  eyeBtn: { padding: Spacing.md },
  
  loginBtn: { marginTop: Spacing.sm, paddingVertical: Spacing.md + 2 },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
  dividerText: { marginHorizontal: Spacing.md, color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  socialBtnPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.white, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, gap: Spacing.sm, ...Shadows.sm, shadowOpacity: isDark ? 0 : 0.05 },
  socialBtnText: { fontSize: 14, fontWeight: '800', color: colors.text },
  
  footer: { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.md },
  footerPolicy: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  footerText: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  linkText: { color: Colors.green[500], fontSize: 15, fontWeight: '800' },
  
  /* S&K Modal Styles */
  modalHeader: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginLeft: Spacing.md },
  skHeroTitle: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  skSubTitle: { fontSize: 20, fontWeight: '700', color: Colors.green[500], marginBottom: Spacing.xl },
  skText: { fontSize: 15, color: colors.text, lineHeight: 24 },
  skBold: { fontWeight: '900', color: colors.text, fontSize: 16 },
  modalFooter: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  skBtn: { paddingVertical: 18, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  skBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  /* OTP Vault Styles */
  otpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  otpCard: { backgroundColor: colors.surface, padding: Spacing.xl, borderRadius: BorderRadius['2xl'], width: '100%', alignItems: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent' },
  otpIconRing: { width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : Colors.green[50], alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  otpTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 8 },
  otpDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  otpEmail: { fontWeight: '800', color: colors.text },
  otpError: { color: Colors.danger, marginBottom: Spacing.md, textAlign: 'center', fontWeight: '600' },
  otpVaultInputWrap: { width: '100%', backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : Colors.gray[100], borderRadius: BorderRadius.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border },
  otpVaultInput: { textAlign: 'center', fontWeight: '900', fontSize: 32, letterSpacing: 16, color: colors.text, paddingVertical: Spacing.lg },
  otpCancelText: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
});
