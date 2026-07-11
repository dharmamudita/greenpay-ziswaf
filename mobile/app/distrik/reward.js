import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import { router } from 'expo-router';

export default function RewardScreen() {
  const { colors, isDark } = useTheme();
  const [voucherCode, setVoucherCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rewards, setRewards] = useState([]);

  const dynamicStyles = getStyles(colors, isDark);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/distrik/rewards');
      setRewards(res.data);
    } catch (error) {
      console.log('Error fetching rewards:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRewards();
  }, []);

  const handleVerify = async () => {
    if (!voucherCode.trim()) {
      return Alert.alert('Error', 'Masukkan kode voucher terlebih dahulu.');
    }
    
    setVerifying(true);
    try {
      const res = await api.post('/distrik/rewards/verify', { voucher_code: voucherCode.trim() });
      Alert.alert('Sukses!', 'Voucher valid dan berhasil ditukarkan.');
      setVoucherCode('');
      fetchRewards(); // refresh list
    } catch (error) {
      Alert.alert('Gagal', error.response?.data?.error || 'Kode voucher tidak valid atau sudah digunakan.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />}
      >
        <View style={dynamicStyles.container}>
          
          <Text style={dynamicStyles.title}>Verifikasi Reward</Text>
          <Text style={dynamicStyles.subtitle}>Verifikasi kode voucher milik pengguna saat mereka mengambil barang di bank sampah Anda.</Text>

          {/* Scanner / Input Card */}
          <View style={[dynamicStyles.scannerCard, Shadows.md]}>
            <LinearGradient 
              colors={isDark ? ['#3B0764', '#1E1B4B'] : [Colors.purple, '#7E22CE']} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }}
              style={dynamicStyles.scannerGradient}
            >
              <View style={dynamicStyles.scannerHeader}>
                <Ionicons name="barcode-outline" size={32} color={Colors.white} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles.scannerTitle}>Verifikasi Kode Unik</Text>
                  <Text style={dynamicStyles.scannerSub}>Masukkan kode voucher pengguna</Text>
                </View>
              </View>

              <View style={dynamicStyles.inputWrap}>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Ketik kode (misal: GRN-X7Y9)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={voucherCode}
                  onChangeText={(v) => setVoucherCode(v.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity 
                style={[dynamicStyles.verifyBtn, verifying && { opacity: 0.7 }]}
                onPress={handleVerify}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color={Colors.purple} />
                ) : (
                  <Text style={dynamicStyles.verifyBtnText}>TUKARKAN BARANG</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* List of Redemptions */}
          <View style={dynamicStyles.listHeader}>
            <Text style={dynamicStyles.sectionTitle}>Riwayat Transaksi Penukaran</Text>
          </View>

          {rewards.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: 12 }}>Belum ada riwayat penukaran hadiah.</Text>
            </View>
          ) : (
            <View style={dynamicStyles.list}>
              {rewards.map((reward, idx) => {
                const isCompleted = reward.status === 'completed';
                return (
                  <View key={reward.id || idx} style={dynamicStyles.rewardItem}>
                    <View style={[dynamicStyles.rewardIcon, { backgroundColor: isCompleted ? Colors.green[500] + '20' : Colors.gold[500] + '20' }]}>
                      <Ionicons name={isCompleted ? "checkmark-circle" : "time"} size={24} color={isCompleted ? Colors.green[500] : Colors.gold[500]} />
                    </View>
                    <View style={dynamicStyles.rewardInfo}>
                      <Text style={dynamicStyles.rewardUser}>{reward.user_name}</Text>
                      <Text style={dynamicStyles.rewardItemName}>{reward.reward_name}</Text>
                      <Text style={dynamicStyles.rewardCode}>Kode: {reward.voucher_code || '-'}</Text>
                    </View>
                    <View style={[dynamicStyles.statusBadge, { backgroundColor: isCompleted ? Colors.green[500] + '20' : Colors.gold[500] + '20' }]}>
                      <Text style={[dynamicStyles.statusText, { color: isCompleted ? Colors.green[500] : Colors.gold[500] }]}>
                        {isCompleted ? 'SELESAI' : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        </View>
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: Spacing['2xl'] },
  
  // Scanner Card
  scannerCard: { borderRadius: BorderRadius['2xl'], marginBottom: Spacing['2xl'] },
  scannerGradient: { borderRadius: BorderRadius['2xl'], padding: Spacing.xl, overflow: 'hidden' },
  scannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  scannerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  scannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  inputWrap: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: Spacing.lg },
  input: { paddingHorizontal: 16, paddingVertical: 14, color: Colors.white, fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: 2 },
  verifyBtn: { backgroundColor: Colors.white, paddingVertical: 14, borderRadius: BorderRadius.xl, alignItems: 'center' },
  verifyBtnText: { color: Colors.purple, fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  // List
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  list: { gap: Spacing.md },
  rewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: colors.border },
  rewardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rewardInfo: { flex: 1 },
  rewardUser: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  rewardItemName: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  rewardCode: { fontSize: 11, color: colors.text, fontWeight: '800', marginTop: 4, letterSpacing: 1 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: '900' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
});
