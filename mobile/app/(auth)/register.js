import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(ROLES.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  const handleRegister = async () => {
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
    setLoading(true);
    try {
      await register(email, password, name, role);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={dynamicStyles.container} keyboardShouldPersistTaps="handled">
        <View style={dynamicStyles.header}>
          <LinearGradient colors={[Colors.green[600], Colors.green[500]]} style={dynamicStyles.logo}>
            <Ionicons name="leaf" size={32} color={Colors.white} />
          </LinearGradient>
          <Text style={dynamicStyles.title}>Buat Akun</Text>
          <Text style={dynamicStyles.subtitle}>Bergabung di GreenPay ZISWAF</Text>
        </View>

        {error ? (
          <View style={dynamicStyles.errorBox}>
            <Text style={dynamicStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Role Selector */}
        <View style={dynamicStyles.roleWrap}>
          {[
            { value: ROLES.USER, label: 'Pengguna', icon: 'person', desc: 'Setor sampah, donasi, kumpulkan poin' },
            { value: ROLES.DISTRIK, label: 'Distrik', icon: 'business', desc: 'Kelola bank sampah & verifikasi' },
          ].map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[dynamicStyles.roleBtn, role === r.value && dynamicStyles.roleBtnActive]}
              onPress={() => setRole(r.value)}
            >
              <Ionicons name={r.icon} size={20} color={role === r.value ? Colors.green[500] : colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[dynamicStyles.roleName, role === r.value && { color: role === r.value && isDark ? Colors.white : Colors.green[600] }]}>{r.label}</Text>
                <Text style={dynamicStyles.roleDesc}>{r.desc}</Text>
              </View>
              {role === r.value && <Ionicons name="checkmark-circle" size={20} color={Colors.green[500]} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={dynamicStyles.form}>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Nama Lengkap</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput style={dynamicStyles.input} placeholder="Masukkan nama" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Email</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput style={dynamicStyles.input} placeholder="nama@email.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Password</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput style={[dynamicStyles.input, { flex: 1 }]} placeholder="Min. 6 karakter" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={dynamicStyles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Konfirmasi Password</Text>
            <View style={dynamicStyles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={dynamicStyles.inputIcon} />
              <TextInput style={dynamicStyles.input} placeholder="Ulangi password" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>
          </View>

          <Button title="Daftar Sekarang" onPress={handleRegister} loading={loading} />

          <View style={dynamicStyles.footer}>
            <Text style={dynamicStyles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={dynamicStyles.linkText}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: Spacing.xl, paddingTop: Spacing['4xl'] },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.base, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  roleWrap: { gap: Spacing.sm, marginBottom: Spacing.lg },
  roleBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: colors.border },
  roleBtnActive: { borderColor: Colors.green[500], backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)' },
  roleName: { fontSize: 14, fontWeight: '700', color: colors.text },
  roleDesc: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  form: { gap: Spacing.base },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  inputIcon: { paddingLeft: Spacing.md },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  eyeBtn: { padding: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: colors.textMuted, fontSize: 14 },
  linkText: { color: Colors.green[500], fontSize: 14, fontWeight: '700' },
});
