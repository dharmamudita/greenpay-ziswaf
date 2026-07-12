import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Modal, SafeAreaView } from 'react-native';
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
import * as Clipboard from 'expo-clipboard';

export default function AccountSettingScreen() {
  const { user, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
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

  const passportIdStr = user?.passport_id ? String(user.passport_id).padStart(8, '0') : '00000000';

  const copyPassportId = async () => {
    await Clipboard.setStringAsync(passportIdStr);
    Alert.alert(t('account.copied', {defaultValue: 'Disalin!'}), t('account.copied_desc', {defaultValue: `ID ${passportIdStr} berhasil disalin ke clipboard.`, id: passportIdStr}));
  };

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
      t('account.change_avatar', {defaultValue: 'Ubah Foto Profil'}),
      t('account.choose_source', {defaultValue: 'Pilih sumber foto Anda'}),
      [
        {
          text: t('account.open_camera', {defaultValue: 'Buka Kamera'}),
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(t('bank_sampah.permission_denied', {defaultValue: 'Izin Ditolak'}), t('account.camera_req', {defaultValue: 'Dibutuhkan akses kamera.'}));
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
          text: t('account.choose_gallery', {defaultValue: 'Pilih dari Galeri'}),
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(t('bank_sampah.permission_denied', {defaultValue: 'Izin Ditolak'}), t('account.gallery_req', {defaultValue: 'Anda perlu mengizinkan akses galeri.'}));
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
        { text: t('admin.cancel', {defaultValue: 'Batal'}), style: 'cancel' }
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
      Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('account.avatar_updated', {defaultValue: 'Foto profil berhasil diperbarui.'}));
    } catch (error) {
      console.error(error);
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('account.avatar_fail', {defaultValue: 'Terjadi kesalahan saat mengunggah foto profil.'}));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadCoverPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('bank_sampah.permission_denied', {defaultValue: 'Izin Ditolak'}), t('account.cover_req', {defaultValue: 'Dibutuhkan akses galeri untuk foto sampul.'}));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setUploadingCover(true);
        const imageUrl = await uploadToCloudinary(result.assets[0].uri);
        await api.put('/users/me', { cover_photo_url: imageUrl });
        await refreshProfile();
        Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('account.cover_updated', {defaultValue: 'Foto sampul berhasil diperbarui.'}));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('account.cover_fail', {defaultValue: 'Gagal mengunggah foto sampul.'}));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('account.err_name', {defaultValue: 'Nama tidak boleh kosong.'}));
      return;
    }
    setLoadingProfile(true);
    try {
      await api.put('/users/me', { display_name: name, phone, address });
      await refreshProfile();
      Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('account.profile_updated', {defaultValue: 'Data diri berhasil diperbarui.'}));
    } catch (err) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), err.response?.data?.error || t('account.profile_fail', {defaultValue: 'Gagal memperbarui profil.'}));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('account.err_email', {defaultValue: 'Email tidak boleh kosong.'}));
      return;
    }
    setLoadingEmail(true);
    try {
      await api.post('/auth/request-otp', { email: email, type: 'change_email' });
      setOtpType('change_email');
      setOtpVisible(true);
    } catch (err) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), err.response?.data?.error || t('account.email_otp_fail', {defaultValue: 'Gagal mengirim OTP ke email baru.'}));
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('account.err_pass', {defaultValue: 'Password lama dan baru harus diisi.'}));
      return;
    }
    setLoadingPassword(true);
    try {
      await api.post('/auth/request-otp', { email: user.email, type: 'change_password' });
      setOtpType('change_password');
      setOtpVisible(true);
    } catch (err) {
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), err.response?.data?.error || t('account.sec_otp_fail', {defaultValue: 'Gagal mengirim OTP keamanan.'}));
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
        Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('account.email_updated', {defaultValue: 'Email berhasil diperbarui.'}));
      } else if (otpType === 'change_password') {
        await api.put('/users/me/password', { oldPassword, newPassword });
        setOldPassword('');
        setNewPassword('');
        Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('account.pass_updated', {defaultValue: 'Password berhasil diubah.'}));
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
      <SafeAreaView style={dynamicStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.container}>
          
          {/* Unified Cover & Avatar Area */}
          <TouchableOpacity 
            style={dynamicStyles.profileCard} 
            activeOpacity={0.9} 
            onPress={handleUploadCoverPhoto}
            disabled={uploadingCover}
          >
            {user?.cover_photo_url ? (
              <Image source={{ uri: user.cover_photo_url }} style={StyleSheet.absoluteFillObject} />
            ) : (
              <LinearGradient 
                colors={[isDark ? 'rgba(16, 185, 129, 0.2)' : Colors.green[100], isDark ? colors.surface : Colors.green[50]]} 
                style={StyleSheet.absoluteFillObject}
              />
            )}
            
            <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFillObject} />
            
            <View style={dynamicStyles.editCoverBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
              <Text style={dynamicStyles.editCoverText}>{uploadingCover ? t('account.uploading') : t('account.change_cover')}</Text>
            </View>

            <View style={dynamicStyles.profileCardContent}>
              <TouchableOpacity 
                style={dynamicStyles.avatarOuter} 
                onPress={handleUpdateAvatar} 
                activeOpacity={0.8}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <View style={dynamicStyles.avatar}>
                    <ActivityIndicator size="large" color={Colors.white} />
                  </View>
                ) : user?.photo_url ? (
                  <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatar} />
                ) : (
                  <View style={dynamicStyles.avatarPlaceholder}>
                    <Ionicons name="person" size={48} color={Colors.white} />
                  </View>
                )}
                <View style={dynamicStyles.cameraBadge}>
                  <Ionicons name="camera" size={12} color={Colors.white} />
                </View>
              </TouchableOpacity>
              
              <View style={dynamicStyles.userInfoCol}>
                <Text style={dynamicStyles.userName} numberOfLines={1}>{user?.display_name || 'Pengguna'}</Text>
                
                <TouchableOpacity 
                  style={dynamicStyles.idBorderWrap}
                  onPress={copyPassportId}
                  activeOpacity={0.7}
                >
                  <Text style={dynamicStyles.userIdText}>
                    ID: {passportIdStr}
                  </Text>
                  <Ionicons name="copy-outline" size={12} color={Colors.white} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                
                <Text style={dynamicStyles.userHelpText}>{t('account.tap_to_change_photo')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Photo Preview Modal - Professional Crop Editor */}
          <Modal visible={!!previewUri} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.surface, borderRadius: 28, padding: 0, width: '92%', maxWidth: 380, alignItems: 'center', overflow: 'hidden' }}>
                {/* Header */}
                <View style={{ width: '100%', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' }}>{t('account.adjust_photo')}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>{t('account.zoom_hint')}</Text>
                </View>

                {/* Crop Area with Grid */}
                <View style={{ width: 260, height: 260, margin: 20, borderRadius: 130, overflow: 'hidden', position: 'relative', borderWidth: 3, borderColor: Colors.green[500] }}>
                  {previewUri && (
                    <Image 
                      source={{ uri: previewUri }} 
                      style={{ 
                        width: 260, 
                        height: 260, 
                        transform: [{ scale: zoomLevel }],
                      }} 
                      resizeMode="cover"
                    />
                  )}
                  {/* Grid Overlay - Rule of Thirds */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {/* Vertical lines */}
                    <View style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <View style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    {/* Horizontal lines */}
                    <View style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <View style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    {/* Center crosshair */}
                    <View style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -8, marginLeft: -8, width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' }} />
                  </View>
                </View>

                {/* Zoom Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, width: '100%', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => setZoomLevel(Math.max(1, zoomLevel - 0.1))} style={{ padding: 8 }}>
                    <Ionicons name="remove-circle-outline" size={26} color={colors.textMuted} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, height: 36, justifyContent: 'center', marginHorizontal: 8 }}>
                    {/* Zoom track */}
                    <View style={{ height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 2, position: 'relative' }}>
                      <View style={{ height: 4, backgroundColor: Colors.green[500], borderRadius: 2, width: `${((zoomLevel - 1) / 1.5) * 100}%` }} />
                      <View style={{ 
                        position: 'absolute', 
                        top: -8, 
                        left: `${((zoomLevel - 1) / 1.5) * 100}%`, 
                        marginLeft: -10,
                        width: 20, height: 20, 
                        borderRadius: 10, 
                        backgroundColor: Colors.green[500], 
                        borderWidth: 3, 
                        borderColor: colors.surface,
                        ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
                      }} />
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.1))} style={{ padding: 8 }}>
                    <Ionicons name="add-circle-outline" size={26} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 16 }}>{Math.round(zoomLevel * 100)}%</Text>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <TouchableOpacity 
                    onPress={() => { setPreviewUri(null); setZoomLevel(1); }} 
                    style={{ flex: 1, padding: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textMuted }}>{t('account.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={confirmUpload} 
                    style={{ flex: 1, padding: 16, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.green[500] }}>{t('account.use_photo')}</Text>
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
            <Button title={t('account.save_email', { defaultValue: 'Simpan Email' })} onPress={handleUpdateEmail} loading={loadingEmail} style={{ marginTop: Spacing.sm }} />
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
            <Button title={t('account.change_password', { defaultValue: 'Ubah Password' })} onPress={handleChangePassword} loading={loadingPassword} style={{ marginTop: Spacing.sm }} />
          </View>

          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal Verifikasi OTP */}
      {otpVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000, elevation: 10 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 24, width: '100%', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : Colors.green[50], alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="mail-open" size={32} color={Colors.green[500]} />
              </View>
              
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 }}>{t('account.check_email')}</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                {t('account.otp_sent')} <Text style={{ fontWeight: '700', color: colors.text }}>{otpType === 'change_email' ? email : user?.email}</Text>.
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
                {loadingOtp ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>{t('account.verify_save')}</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setOtpVisible(false)} disabled={loadingOtp}>
                <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>{t('account.cancel')}</Text>
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
  container: { paddingHorizontal: Spacing.xl, paddingBottom: 100, paddingTop: 40 },
  
  // Unified Profile Card
  profileCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isDark ? colors.surface : Colors.green[50],
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing['2xl'],
    marginTop: 20,
    ...Shadows.md,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 45, // Space for the top right button
  },
  editCoverBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
  },
  editCoverText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  
  avatarOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.lg,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  userInfoCol: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  userName: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  idBorderWrap: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIdText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userHelpText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  
  cameraBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: Colors.green[500], 
    padding: 6, 
    borderRadius: 15, 
    borderWidth: 2, 
    borderColor: Colors.white,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  card: { backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: Spacing.xs, marginLeft: 4 },
  input: { backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200], color: colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: 15 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200] },
  eyeBtn: { padding: Spacing.md },
});
