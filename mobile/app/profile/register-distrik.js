import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function RegisterDistrikScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); 
  const [refreshing, setRefreshing] = useState(false);
  
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/distrik/status');
      setStatus(res.data.status);
    } catch (error) {
      console.log('Error checking status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkStatus();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.phone) {
      Alert.alert('Error', 'Semua kolom wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/request-otp', { email: user.email, type: 'register_distrik' });
      setOtpVisible(true);
    } catch (error) {
      console.log('Error requesting OTP:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.error || 'Gagal mengirim OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setOtpError('OTP harus 6 digit.');
    setLoadingOtp(true);
    setOtpError('');
    try {
      await api.post('/auth/verify-otp', { email: user.email, otp, type: 'register_distrik' });
      await api.post('/distrik/register', form);
      setOtpVisible(false);
      Alert.alert('Sukses', 'Pengajuan berhasil dikirim! Menunggu verifikasi admin.');
      checkStatus(); 
    } catch (error) {
      setOtpError(error.response?.data?.error || 'OTP tidak valid.');
    } finally {
      setLoadingOtp(false);
    }
  };

  if (loading) {
    return (
      <View style={dynamicStyles.centerScreen}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  if (status === 'pending') {
    return (
      <ScrollView 
        contentContainerStyle={dynamicStyles.centerScreen}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        <Ionicons name="time-outline" size={80} color={Colors.info} />
        <Text style={dynamicStyles.title}>{t('reg_distrik.waiting', {defaultValue: 'Menunggu Verifikasi'})}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('reg_distrik.waiting_desc', {defaultValue: 'Pengajuan Anda sebagai Distrik Sampah sedang ditinjau oleh Admin. Mohon bersabar ya!'})}
        </Text>
        <TouchableOpacity style={dynamicStyles.backBtn} onPress={() => router.back()}>
          <Text style={dynamicStyles.backBtnText}>{t('reg_distrik.back', {defaultValue: 'Kembali'})}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25}
    >
      <ScrollView contentContainerStyle={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Ionicons name="business" size={60} color={Colors.green[500]} />
          <Text style={dynamicStyles.title}>{t('reg_distrik.title', {defaultValue: 'Daftar Distrik Sampah'})}</Text>
          <Text style={dynamicStyles.subtitle}>
            {t('reg_distrik.subtitle', {defaultValue: 'Bergabunglah menjadi mitra pengelola sampah di lingkungan Anda dan tebarkan manfaat.'})}
          </Text>
        </View>

        <View style={dynamicStyles.formCard}>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('reg_distrik.name_label', {defaultValue: 'Nama Bank Sampah / Distrik'})}</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="home-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput
                style={dynamicStyles.input}
                placeholder="Contoh: Bank Sampah Berkah"
                placeholderTextColor={colors.textMuted}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('reg_distrik.address_label', {defaultValue: 'Alamat Lengkap'})}</Text>
            <View style={[dynamicStyles.inputWrap, { alignItems: 'flex-start' }]}>
              <Ionicons name="location-outline" size={20} color={colors.textMuted} style={[dynamicStyles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Masukkan alamat lengkap distrik..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('reg_distrik.phone_label', {defaultValue: 'Nomor WhatsApp/HP'})}</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput
                style={dynamicStyles.input}
                placeholder="08123456789"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
            </View>
          </View>

          <TouchableOpacity style={dynamicStyles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={dynamicStyles.submitBtnText}>{t('reg_distrik.submit', {defaultValue: 'Kirim Pengajuan'})}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Verifikasi OTP */}
      {otpVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000, elevation: 10 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 24, width: '100%', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : Colors.green[50], alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="mail-open" size={32} color={Colors.green[500]} />
              </View>
              
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 }}>{t('reg_distrik.check_email', {defaultValue: 'Cek Email Anda'})}</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                Kami telah mengirimkan OTP keamanan ke <Text style={{ fontWeight: '700', color: colors.text }}>{user?.email}</Text>.
              </Text>

              {otpError ? (
                <Text style={{ color: Colors.error, marginBottom: 16, textAlign: 'center' }}>{otpError}</Text>
              ) : null}

              <View style={[dynamicStyles.inputWrap, { width: '100%', marginBottom: 16, paddingHorizontal: 0, justifyContent: 'center' }]}>
                <TextInput 
                  style={[dynamicStyles.input, { textAlign: 'center', fontWeight: '900', fontSize: 24, letterSpacing: 10 }]} 
                  placeholder="------" 
                  placeholderTextColor={colors.textMuted} 
                  value={otp} 
                  onChangeText={setOtp} 
                  keyboardType="number-pad" 
                  maxLength={6}
                />
              </View>

              <TouchableOpacity style={[dynamicStyles.submitBtn, { width: '100%', marginBottom: 12 }]} onPress={handleVerifyOtp} disabled={loadingOtp}>
                {loadingOtp ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.submitBtnText}>{t('reg_distrik.verify', {defaultValue: 'Verifikasi'})}</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setOtpVisible(false)} disabled={loadingOtp}>
                <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>{t('reg_distrik.cancel', {defaultValue: 'Batal'})}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: 24, paddingBottom: 100 },
  centerScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  formCard: { backgroundColor: colors.surface, padding: 24, borderRadius: 24, borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  inputGroup: { marginBottom: 20, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: 16, borderWidth: 1.5, borderColor: isDark ? colors.border : Colors.gray[200] },
  inputIcon: { paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 14, paddingRight: 16 },
  submitBtn: { backgroundColor: Colors.green[500], padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  backBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  backBtnText: { color: colors.text, fontWeight: '600' }
});
