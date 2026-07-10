import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Input Email, 2: Input OTP & New Password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const dynamicStyles = getStyles(colors, isDark);

  const handleSendOtp = async () => {
    if (!email) {
      setError(t('forgot_password.error_empty_email'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Sukses', t('forgot_password.success_otp_sent'));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim email reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setError(t('forgot_password.error_empty_data'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('forgot_password.error_short_password'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert('Berhasil', t('forgot_password.success_reset'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      <LinearGradient colors={[isDark ? Colors.dark.surface2 : Colors.green[50], colors.bg]} style={{ flex: 1 }}>
        
        {/* Back Button */}
        <TouchableOpacity style={dynamicStyles.backBtn} onPress={() => step === 2 ? setStep(1) : router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled">
          <View style={dynamicStyles.header}>
            <View style={[dynamicStyles.logoWrap, Shadows.md]}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={dynamicStyles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={dynamicStyles.title}>{t('forgot_password.title')}</Text>
            <Text style={dynamicStyles.subtitle}>
              {step === 1 ? t('forgot_password.subtitle_step1') : t('forgot_password.subtitle_step2')}
            </Text>
          </View>

          {error ? (
            <View style={dynamicStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#F87171" />
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={[dynamicStyles.formCard, Shadows.md]}>
            <View style={dynamicStyles.form}>
              
              {step === 1 ? (
                <>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.label}>{t('forgot_password.email_label')}</Text>
                    <View style={dynamicStyles.inputWrap}>
                      <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                      <TextInput 
                        style={dynamicStyles.input} 
                        placeholder={t('forgot_password.email_placeholder')} 
                        placeholderTextColor={colors.textMuted} 
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address" 
                        autoCapitalize="none" 
                      />
                    </View>
                  </View>
                  <Button title={t('forgot_password.send_otp_btn')} onPress={handleSendOtp} loading={loading} style={{ marginTop: Spacing.md }} />
                </>
              ) : (
                <>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.label}>{t('forgot_password.otp_label')}</Text>
                    <View style={dynamicStyles.inputWrap}>
                      <Ionicons name="keypad-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                      <TextInput 
                        style={dynamicStyles.input} 
                        placeholder={t('forgot_password.otp_placeholder')} 
                        placeholderTextColor={colors.textMuted} 
                        value={otp} 
                        onChangeText={setOtp} 
                        keyboardType="number-pad" 
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.label}>{t('forgot_password.new_password_label')}</Text>
                    <View style={dynamicStyles.inputWrap}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
                      <TextInput 
                        style={[dynamicStyles.input, { flex: 1 }]} 
                        placeholder={t('forgot_password.new_password_placeholder')} 
                        placeholderTextColor={colors.textMuted} 
                        value={newPassword} 
                        onChangeText={setNewPassword} 
                        secureTextEntry={!showPassword} 
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Button title={t('forgot_password.reset_btn')} onPress={handleResetPassword} loading={loading} style={{ marginTop: Spacing.md }} />
                </>
              )}

            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.xl, paddingTop: height * 0.05, paddingBottom: 100 },
  backBtn: { position: 'absolute', top: Spacing.xl + 20, left: Spacing.xl, zIndex: 10, padding: Spacing.sm, backgroundColor: colors.surface, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: colors.border },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'], marginTop: Spacing.xl },
  logoWrap: { borderRadius: BorderRadius['2xl'], marginBottom: Spacing.xl },
  logo: { width: 72, height: 72, borderRadius: BorderRadius['2xl'], alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: Spacing.sm, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMuted, fontWeight: '500', textAlign: 'center', paddingHorizontal: Spacing.lg },
  
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA' },
  errorText: { color: isDark ? '#FCA5A5' : '#EF4444', fontSize: 13, fontWeight: '500', flex: 1 },
  
  formCard: { backgroundColor: colors.surface, padding: Spacing.xl, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: isDark ? colors.border : Colors.gray[200] },
  inputIcon: { paddingLeft: Spacing.md },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.md, fontWeight: '500' },
  eyeBtn: { padding: Spacing.md },
});
