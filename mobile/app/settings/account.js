import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function AccountSettingScreen() {
  const { user, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const { t } = useTranslation();

  // Email Form State
  const [email, setEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // OTP State
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpType, setOtpType] = useState(null); // 'change_email' or 'change_password'
  const [otp, setOtp] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.display_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const dynamicStyles = getStyles(colors, isDark);

  const handleUpdateAvatar = () => {
    if (Platform.OS === 'web') {
      (async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
        processImageResult(result);
      })();
      return;
    }

    Alert.alert(
      'Ubah Foto Profil',
      'Pilih sumber foto Anda',
      [
        {
          text: 'Buka Kamera',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Izin Ditolak', 'Dibutuhkan akses kamera.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            processImageResult(result);
          }
        },
        {
          text: 'Pilih dari Galeri',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Izin Ditolak', 'Anda perlu mengizinkan akses galeri.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            processImageResult(result);
          }
        },
        { text: 'Batal', style: 'cancel' }
      ]
    );
  };

  const processImageResult = async (result) => {
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const confirmUpload = async () => {
    if (!previewUri) return;
    setUploadingAvatar(true);
    setPreviewUri(null);
    try {
      const imageUrl = await uploadToCloudinary(previewUri);
      await api.put('/users/me', { photo_url: imageUrl });
      await refreshProfile();
      Alert.alert('Sukses', 'Foto profil berhasil diperbarui.');
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengunggah foto profil.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert('Gagal', 'Nama tidak boleh kosong.');
      return;
    }
    setLoadingProfile(true);
    try {
      await api.put('/users/me', { display_name: name, phone, address });
      await refreshProfile();
      Alert.alert('Sukses', 'Data diri berhasil diperbarui.');
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.error || 'Gagal memperbarui profil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) {
      Alert.alert('Gagal', 'Email tidak boleh kosong.');
      return;
    }
    setLoadingEmail(true);
    try {
      await api.post('/auth/request-otp', { email: email, type: 'change_email' });
      setOtpType('change_email');
      setOtpVisible(true);
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.error || 'Gagal mengirim OTP ke email baru.');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Gagal', 'Password lama dan baru harus diisi.');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.post('/auth/request-otp', { email: user.email, type: 'change_password' });
      setOtpType('change_password');
      setOtpVisible(true);
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.error || 'Gagal mengirim OTP keamanan.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setOtpError('OTP harus 6 digit.');
    setLoadingOtp(true);
    setOtpError('');
    try {
      const targetEmail = otpType === 'change_email' ? email : user.email;
      await api.post('/auth/verify-otp', { email: targetEmail, otp, type: otpType });
      
      // Proceed with actual operation
      if (otpType === 'change_email') {
        await api.put('/users/me', { email });
        await refreshProfile();
        Alert.alert('Sukses', 'Email berhasil diperbarui.');
      } else if (otpType === 'change_password') {
        await api.put('/users/me/password', { oldPassword, newPassword });
        setOldPassword('');
        setNewPassword('');
        Alert.alert('Sukses', 'Password berhasil diubah.');
      }
      
      setOtpVisible(false);
      setOtp('');
    } catch (err) {
      setOtpError(err.response?.data?.error || 'OTP tidak valid.');
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          
          {/* Avatar Section */}
          <View style={dynamicStyles.avatarSection}>
            <TouchableOpacity 
              style={[dynamicStyles.avatarOuter, Shadows.md, { backgroundColor: colors.bg }]} 
              onPress={handleUpdateAvatar} 
              activeOpacity={0.8}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <View style={dynamicStyles.avatar}>
                  <ActivityIndicator size="large" color={Colors.green[500]} />
                </View>
              ) : user?.photo_url ? (
                <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatar} />
              ) : (
                <LinearGradient colors={[Colors.green[400], Colors.green[600]]} style={dynamicStyles.avatar}>
                  <Text style={dynamicStyles.avatarText}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
                </LinearGradient>
              )}
              <View style={dynamicStyles.cameraBadge}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, fontWeight: '500' }}>{t('account.tap_to_change_photo', { defaultValue: 'Ketuk untuk ubah foto' })}</Text>
          </View>

          {/* Photo Preview Modal */}
          <Modal visible={!!previewUri} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Pratinjau Foto Profil</Text>
                {previewUri && (
                  <Image source={{ uri: previewUri }} style={{ width: 180, height: 180, borderRadius: 90, marginBottom: 20 }} />
                )}
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20, textAlign: 'center' }}>Apakah Anda yakin ingin menggunakan foto ini?</Text>
                <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                  <TouchableOpacity 
                    onPress={() => setPreviewUri(null)} 
                    style={{ flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textMuted }}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={confirmUpload} 
                    style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: Colors.green[500], alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.white }}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Data Diri Section */}
          <Text style={dynamicStyles.sectionTitle}>{t('account.personal_data', { defaultValue: 'Data Diri' })}</Text>
          <View style={[dynamicStyles.card, Shadows.sm]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.full_name', { defaultValue: 'Nama Lengkap' })}</Text>
              <TextInput style={dynamicStyles.input} value={name} onChangeText={setName} placeholder={t('account.name_placeholder')} placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.phone', { defaultValue: 'Nomor HP' })}</Text>
              <TextInput style={dynamicStyles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.address', { defaultValue: 'Alamat' })}</Text>
              <TextInput style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} placeholder={t('account.address')} placeholderTextColor={colors.textMuted} multiline />
            </View>
            <Button title={t('account.save_personal_data', { defaultValue: 'Simpan Data Diri' })} onPress={handleUpdateProfile} loading={loadingProfile} style={{ marginTop: Spacing.sm }} />
          </View>

          {/* Email Section */}
          <Text style={[dynamicStyles.sectionTitle, { marginTop: Spacing.xl }]}>{t('account.email_settings', { defaultValue: 'Pengaturan Email' })}</Text>
          <View style={[dynamicStyles.card, Shadows.sm]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.email', { defaultValue: 'Email' })}</Text>
              <TextInput style={dynamicStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@contoh.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
            </View>
            <Button title={t('account.save_email', { defaultValue: 'Simpan Email' })} onPress={handleUpdateEmail} loading={loadingEmail} style={{ marginTop: Spacing.sm, backgroundColor: Colors.purple }} />
          </View>

          {/* Security / Password Section */}
          <Text style={[dynamicStyles.sectionTitle, { marginTop: Spacing.xl }]}>{t('account.security', { defaultValue: 'Keamanan' })}</Text>
          <View style={[dynamicStyles.card, Shadows.sm, { marginBottom: Spacing['3xl'] }]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.old_password', { defaultValue: 'Password Lama' })}</Text>
              <View style={dynamicStyles.passwordWrap}>
                <TextInput style={[dynamicStyles.input, { flex: 1, borderWidth: 0 }]} value={oldPassword} onChangeText={setOldPassword} secureTextEntry={!showPassword} placeholder={t('account.old_password')} placeholderTextColor={colors.textMuted} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.new_password', { defaultValue: 'Password Baru' })}</Text>
              <TextInput style={dynamicStyles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} placeholder={t('account.new_password')} placeholderTextColor={colors.textMuted} />
            </View>
            <Button title={t('account.change_password', { defaultValue: 'Ubah Password' })} onPress={handleChangePassword} loading={loadingPassword} style={{ marginTop: Spacing.sm, backgroundColor: Colors.info }} />
          </View>

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
              
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 }}>Cek Email Anda</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                Kami telah mengirimkan 6-digit OTP keamanan ke <Text style={{ fontWeight: '700', color: colors.text }}>{otpType === 'change_email' ? email : user?.email}</Text>.
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

              <TouchableOpacity style={[dynamicStyles.submitBtn, { width: '100%', marginBottom: 12, backgroundColor: Colors.green[500], padding: 16, borderRadius: 16, alignItems: 'center' }]} onPress={handleVerifyOtp} disabled={loadingOtp}>
                {loadingOtp ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>Verifikasi & Simpan</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setOtpVisible(false)} disabled={loadingOtp}>
                <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarOuter: { padding: 4, borderRadius: 50 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    backgroundColor: Colors.green[500], 
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: colors.bg,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  card: { backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: Spacing.xs, marginLeft: 4 },
  input: { backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200], color: colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: 15 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200] },
  eyeBtn: { padding: Spacing.md },
});
