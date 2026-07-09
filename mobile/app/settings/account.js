import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

export default function AccountSettingScreen() {
  const { user, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          
          <Text style={dynamicStyles.sectionTitle}>Data Pribadi</Text>
          <View style={[dynamicStyles.card, Shadows.sm]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Nama Lengkap</Text>
              <TextInput style={dynamicStyles.input} value={name} onChangeText={setName} placeholder="Nama Anda" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Email</Text>
              <TextInput style={dynamicStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@contoh.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Nomor Telepon</Text>
              <TextInput style={dynamicStyles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Alamat</Text>
              <TextInput style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} placeholder="Alamat lengkap" placeholderTextColor={colors.textMuted} multiline />
            </View>
            <Button title="Simpan Perubahan" onPress={handleUpdateProfile} loading={loadingProfile} style={{ marginTop: Spacing.sm }} />
          </View>

          <Text style={[dynamicStyles.sectionTitle, { marginTop: Spacing.xl }]}>Keamanan (Ubah Password)</Text>
          <View style={[dynamicStyles.card, Shadows.sm, { marginBottom: Spacing['3xl'] }]}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Password Lama</Text>
              <View style={dynamicStyles.passwordWrap}>
                <TextInput style={[dynamicStyles.input, { flex: 1, borderWidth: 0 }]} value={oldPassword} onChangeText={setOldPassword} secureTextEntry={!showPassword} placeholder="Masukkan password lama" placeholderTextColor={colors.textMuted} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Password Baru</Text>
              <TextInput style={dynamicStyles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} placeholder="Minimal 6 karakter" placeholderTextColor={colors.textMuted} />
            </View>
            <Button title="Ubah Password" onPress={handleChangePassword} loading={loadingPassword} style={{ marginTop: Spacing.sm, backgroundColor: Colors.info }} />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  card: { backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: Spacing.xs, marginLeft: 4 },
  input: { backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200], color: colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: 15 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? colors.bg : Colors.gray[50], borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200] },
  eyeBtn: { padding: Spacing.md },
});
