import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function ZiswafDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donating, setDonating] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      // In a real app, you'd fetch specific ID. Since we don't have GET /api/ziswaf/programs/:id, 
      // we fetch all and find it.
      const res = await api.get('/ziswaf/programs');
      const found = res.data.find(p => p.id === id);
      if (found) setProgram(found);
      else {
        Alert.alert('Error', 'Program tidak ditemukan.');
        router.back();
      }
    } catch (error) {
      console.log('Error fetching program detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Diperlukan', 'Silakan login terlebih dahulu untuk berdonasi.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    
    const donAmount = parseInt(amount);
    if (!donAmount || donAmount < 10000) {
      return Alert.alert('Error', 'Minimal donasi adalah Rp 10.000');
    }

    setDonating(true);
    try {
      // 1. Get token & redirect_url from backend
      const res = await api.post('/payment/charge', {
        amount: donAmount,
        program_id: program.id,
        program_name: program.title
      });

      const { redirect_url } = res.data;

      // 2. Open Midtrans payment page
      if (Platform.OS === 'web') {
        window.open(redirect_url, '_blank');
      } else {
        const result = await WebBrowser.openBrowserAsync(redirect_url);
        if (result.type === 'cancel' || result.type === 'dismiss') {
          Alert.alert('Info', 'Anda menutup halaman pembayaran.');
        }
      }
    } catch (error) {
      console.log('Payment error:', error);
      Alert.alert('Error', 'Gagal memproses pembayaran. Coba lagi.');
    } finally {
      setDonating(false);
      setAmount('');
    }
  };

  if (loading || !program) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold[500]} />
      </View>
    );
  }

  const progress = Math.min((program.collected_amount / program.target_amount) * 100, 100);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Detail Donasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.xl }}>
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.title}>{program.title}</Text>
          <Text style={dynamicStyles.desc}>{program.description}</Text>
          
          <View style={dynamicStyles.progressWrap}>
            <View style={dynamicStyles.progressTextRow}>
              <Text style={dynamicStyles.collectedText}>Rp {Number(program.collected_amount).toLocaleString('id-ID')}</Text>
              <Text style={dynamicStyles.targetText}>dari Rp {Number(program.target_amount).toLocaleString('id-ID')}</Text>
            </View>
            <View style={dynamicStyles.progressBarBg}>
              <View style={[dynamicStyles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.label}>Masukkan Nominal (Min. Rp 10.000)</Text>
          <TextInput 
            style={dynamicStyles.input}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={dynamicStyles.presetRow}>
            {[10000, 50000, 100000].map(val => (
              <TouchableOpacity key={val} style={dynamicStyles.presetBtn} onPress={() => setAmount(val.toString())}>
                <Text style={dynamicStyles.presetText}>{val / 1000}K</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[dynamicStyles.donateBtn, donating && { opacity: 0.7 }]}
          onPress={handleDonate}
          disabled={donating}
        >
          {donating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={dynamicStyles.donateBtnText}>Lanjut Pembayaran</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  
  card: { backgroundColor: colors.surface, padding: Spacing.xl, borderRadius: BorderRadius['2xl'], marginBottom: Spacing.xl, borderWidth: 1, borderColor: colors.border, ...Shadows.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  desc: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: Spacing.xl },
  
  progressWrap: { marginBottom: Spacing.md },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
  collectedText: { fontSize: 16, fontWeight: '900', color: Colors.gold[600] },
  targetText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  progressBarBg: { height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[200], borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.gold[400], borderRadius: 4 },

  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.xl, padding: 16, fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: Spacing.md, textAlign: 'center' },
  
  presetRow: { flexDirection: 'row', gap: 12 },
  presetBtn: { flex: 1, paddingVertical: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100], borderRadius: BorderRadius.lg, alignItems: 'center' },
  presetText: { fontSize: 14, fontWeight: '700', color: colors.text },

  donateBtn: { backgroundColor: Colors.gold[500], paddingVertical: 18, borderRadius: BorderRadius.xl, alignItems: 'center', marginTop: Spacing.md },
  donateBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
