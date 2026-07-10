import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spacing } from '../../theme/spacing';

const CompleteProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setAuthState } = useAuth();
  
  const initialEmail = params.email || '';
  const initialName = params.name || '';

  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    
    if (!name || !password || !confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/social-register', {
        email: initialEmail,
        name: name,
        password: password,
      });

      Alert.alert('Pendaftaran Berhasil', 'Akun Anda telah dibuat!');

      await setAuthState(res.data.token, res.data.user);
      router.replace('/(tabs)');

    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftarkan akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Lengkapi Profil</Text>
            <Text style={styles.subtitle}>Satu langkah lagi! Lengkapi nama dan buat kata sandi untuk akun Anda.</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={20} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: '#E5E7EB' }]}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: '#6B7280' }]} 
                  value={initialEmail} 
                  editable={false} 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Masukkan nama lengkap" 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Buat Kata Sandi</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Min. 6 karakter" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword} 
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Ulangi kata sandi" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  secureTextEntry={!showPassword} 
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Simpan & Masuk</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.xl, paddingTop: 60 },
  backButton: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  headerContainer: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#166534', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  errorBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', 
    padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FCA5A5' 
  },
  errorText: { color: '#B91C1C', marginLeft: 8, flex: 1, fontSize: 13 },
  formContainer: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1F2937' },
  eyeBtn: { padding: 4 },
  submitBtn: { backgroundColor: '#10B981', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default CompleteProfile;
