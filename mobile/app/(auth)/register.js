import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, ROLES } from '../../context/AuthContext';
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <LinearGradient colors={[Colors.green[600], Colors.green[500]]} style={styles.logo}>
            <Ionicons name="leaf" size={32} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>Bergabung di GreenPay ZISWAF</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Role Selector */}
        <View style={styles.roleWrap}>
          {[
            { value: ROLES.USER, label: 'Pengguna', icon: 'person', desc: 'Setor sampah, donasi, kumpulkan poin' },
            { value: ROLES.DISTRIK, label: 'Distrik', icon: 'business', desc: 'Kelola bank sampah & verifikasi' },
          ].map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
              onPress={() => setRole(r.value)}
            >
              <Ionicons name={r.icon} size={20} color={role === r.value ? Colors.green[400] : Colors.gray[500]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleName, role === r.value && { color: Colors.white }]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </View>
              {role === r.value && <Ionicons name="checkmark-circle" size={20} color={Colors.green[400]} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.gray[500]} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Masukkan nama" placeholderTextColor={Colors.gray[600]} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.gray[500]} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="nama@email.com" placeholderTextColor={Colors.gray[600]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.gray[500]} style={styles.inputIcon} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min. 6 karakter" placeholderTextColor={Colors.gray[600]} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.gray[500]} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ulangi password" placeholderTextColor={Colors.gray[600]} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>
          </View>

          <Button title="Daftar Sekarang" onPress={handleRegister} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.dark.bg, padding: Spacing.xl, paddingTop: Spacing['4xl'] },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray[400] },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.base, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  roleWrap: { gap: Spacing.sm, marginBottom: Spacing.lg },
  roleBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.dark.border },
  roleBtnActive: { borderColor: Colors.green[500], backgroundColor: 'rgba(16,185,129,0.08)' },
  roleName: { fontSize: 14, fontWeight: '700', color: Colors.gray[300] },
  roleDesc: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  form: { gap: Spacing.base },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: Colors.gray[300] },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.dark.border },
  inputIcon: { paddingLeft: Spacing.md },
  input: { flex: 1, color: Colors.white, fontSize: 15, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  eyeBtn: { padding: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: Colors.gray[400], fontSize: 14 },
  linkText: { color: Colors.green[400], fontSize: 14, fontWeight: '700' },
});
