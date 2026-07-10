import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { t } = useTranslation();

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

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
      setUploadingAvatar(true);
      try {
        const imageUrl = await uploadToCloudinary(result.assets[0].uri);
        await api.put('/users/me', { photo_url: imageUrl });
        await refreshProfile();
        Alert.alert('Sukses', 'Foto profil berhasil diperbarui.');
      } catch (error) {
        console.error(error);
        Alert.alert('Gagal', 'Terjadi kesalahan saat mengunggah foto profil.');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert('Gagal', 'Nama dan Email tidak boleh kosong.');
      return;
    }
    setLoadingProfile(true);
    try {
      await api.put('/users/me', { display_name: name, email, phone, address });
      await refreshProfile();
      Alert.alert('Sukses', 'Data profil berhasil diperbarui.');
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.error || 'Gagal memperbarui profil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Gagal', 'Password lama dan baru harus diisi.');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/users/me/password', { oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      Alert.alert('Sukses', 'Password berhasil diubah.');
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.error || 'Gagal mengubah password.');
    } finally {
      setLoadingPassword(false);
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
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, fontWeight: '500' }}>{t('account.tap_to_change_photo')}</Text>
          </View>

          <Text style={dynamicStyles.sectionTitle}>{t('account.personal_data')}</Text>
          <View style={[dynamicStyles.card, Shadows.sm]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.full_name')}</Text>
              <TextInput style={dynamicStyles.input} value={name} onChangeText={setName} placeholder={t('account.name_placeholder')} placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.email')}</Text>
              <TextInput style={dynamicStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@contoh.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.phone')}</Text>
              <TextInput style={dynamicStyles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.address')}</Text>
              <TextInput style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} placeholder={t('account.address')} placeholderTextColor={colors.textMuted} multiline />
            </View>
            <Button title={t('account.save')} onPress={handleUpdateProfile} loading={loadingProfile} style={{ marginTop: Spacing.sm }} />
          </View>

          <Text style={[dynamicStyles.sectionTitle, { marginTop: Spacing.xl }]}>{t('account.security')}</Text>
          <View style={[dynamicStyles.card, Shadows.sm, { marginBottom: Spacing['3xl'] }]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.old_password')}</Text>
              <View style={dynamicStyles.passwordWrap}>
                <TextInput style={[dynamicStyles.input, { flex: 1, borderWidth: 0 }]} value={oldPassword} onChangeText={setOldPassword} secureTextEntry={!showPassword} placeholder={t('account.old_password')} placeholderTextColor={colors.textMuted} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('account.new_password')}</Text>
              <TextInput style={dynamicStyles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} placeholder={t('account.new_password')} placeholderTextColor={colors.textMuted} />
            </View>
            <Button title={t('account.change_password')} onPress={handleChangePassword} loading={loadingPassword} style={{ marginTop: Spacing.sm, backgroundColor: Colors.info }} />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
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
