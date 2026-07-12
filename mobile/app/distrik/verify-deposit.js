import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function VerifyDepositScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  
  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    if (user?.role !== 'distrik' && user?.role !== 'admin') {
      Alert.alert(t('distrik.access_denied', {defaultValue: 'Akses Ditolak'}), t('distrik.distrik_only', {defaultValue: 'Hanya pengelola distrik yang bisa mengakses halaman ini.'}));
      router.back();
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/waste/pending');
      setPendingDeposits(res.data);
    } catch (error) {
      console.log('Error fetching pending deposits:', error);
      Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.load_failed', {defaultValue: 'Gagal memuat daftar setoran pending.'}));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleVerify = async (id, status) => {
    const actionText = status === 'verified' ? 'Verifikasi (Setujui)' : 'Tolak';
    
    const executeVerify = async () => {
      try {
        await api.put(`/waste/verify/${id}`, { status });
        if (Platform.OS === 'web') {
          window.alert(`Setoran berhasil di-${status === 'verified' ? 'verifikasi' : 'tolak'}.`);
        } else {
          Alert.alert('Sukses', `Setoran berhasil di-${status === 'verified' ? 'verifikasi' : 'tolak'}.`);
        }
        fetchData();
      } catch (error) {
        console.log('Error Verify Deposit:', error.response?.data || error.message);
        if (Platform.OS === 'web') {
          window.alert(error.response?.data?.error || 'Gagal memproses setoran.');
        } else {
          Alert.alert('Error', error.response?.data?.error || 'Gagal memproses setoran.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Apakah Anda yakin ingin ${actionText} setoran sampah ini?`)) {
        executeVerify();
      }
    } else {
      Alert.alert(
        'Konfirmasi',
        `Apakah Anda yakin ingin ${actionText} setoran sampah ini?`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Ya, Lanjutkan', 
            style: status === 'verified' ? 'default' : 'destructive',
            onPress: executeVerify
          }
        ]
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={dynamicStyles.screen} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      <View style={dynamicStyles.container}>
        
        <View style={dynamicStyles.headerInfo}>
          <Text style={dynamicStyles.pageTitle}>{t('distrik.pending_deposit', {defaultValue: 'Setoran Menunggu Verifikasi'})}</Text>
          <Text style={dynamicStyles.pageDesc}>Tinjau dan setujui sampah yang disetorkan warga ke lokasi Anda agar mereka mendapatkan poin.</Text>
        </View>

        {pendingDeposits.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconWrap}>
              <Ionicons name="checkmark-done-circle" size={48} color={Colors.green[500]} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>Gudang Bersih!</Text>
            <Text style={dynamicStyles.emptyDesc}>Tidak ada antrean setoran sampah baru saat ini.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.listContainer}>
            {pendingDeposits.map((item) => (
              <View key={item.id} style={[dynamicStyles.card, Shadows.sm]}>
                <View style={dynamicStyles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={[dynamicStyles.iconBox, { backgroundColor: item.waste_type === 'plastik' ? Colors.info + '20' : item.waste_type === 'logam' ? Colors.gold[500] + '20' : Colors.purple + '20' }]}>
                      <Ionicons 
                        name={item.waste_type === 'plastik' ? 'water' : item.waste_type === 'kertas' ? 'document' : 'cube'} 
                        size={20} 
                        color={item.waste_type === 'plastik' ? Colors.info : item.waste_type === 'logam' ? Colors.gold[500] : Colors.purple} 
                      />
                    </View>
                    <View style={{ marginLeft: Spacing.sm }}>
                      <Text style={dynamicStyles.userName}>{item.user_name}</Text>
                      <Text style={dynamicStyles.dateText}>{new Date(item.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.badgePending}>
                    <Text style={dynamicStyles.badgePendingText}>Pending</Text>
                  </View>
                </View>

                <View style={dynamicStyles.cardBody}>
                  {item.photo_url ? (
                    <Image source={{ uri: item.photo_url }} style={dynamicStyles.wasteImage} />
                  ) : null}
                  
                  <View style={dynamicStyles.detailsRow}>
                    <View style={dynamicStyles.detailItem}>
                      <Text style={dynamicStyles.detailLabel}>Jenis Sampah</Text>
                      <Text style={dynamicStyles.detailValue}>{item.waste_type}</Text>
                    </View>
                    <View style={dynamicStyles.detailItem}>
                      <Text style={dynamicStyles.detailLabel}>Berat</Text>
                      <Text style={dynamicStyles.detailValue}>{parseFloat(item.weight_kg)} Kg</Text>
                    </View>
                    <View style={dynamicStyles.detailItem}>
                      <Text style={dynamicStyles.detailLabel}>Poin (Estimasi)</Text>
                      <Text style={[dynamicStyles.detailValue, { color: Colors.gold[500] }]}>+{item.points_earned} GP</Text>
                    </View>
                  </View>
                  
                  {item.notes ? (
                    <View style={dynamicStyles.notesBox}>
                      <Text style={dynamicStyles.notesLabel}>Catatan:</Text>
                      <Text style={dynamicStyles.notesText}>{item.notes}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={dynamicStyles.cardFooter}>
                  <TouchableOpacity 
                    style={[dynamicStyles.actionBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : Colors.danger + '10' }]} 
                    onPress={() => handleVerify(item.id, 'rejected')}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.danger} />
                    <Text style={[dynamicStyles.actionBtnText, { color: Colors.danger }]}>Tolak</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[dynamicStyles.actionBtn, { backgroundColor: Colors.green[500], flex: 2 }]} 
                    onPress={() => handleVerify(item.id, 'verified')}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    <Text style={[dynamicStyles.actionBtnText, { color: Colors.white }]}>Verifikasi & Beri Poin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={{ height: Spacing['3xl'] }} />
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  
  headerInfo: { marginBottom: Spacing.xl },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  pageDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  emptyState: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing['2xl'] },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50], alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  listContainer: { gap: Spacing.lg },
  
  card: { backgroundColor: colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 15, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  dateText: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badgePending: { backgroundColor: Colors.gold[500] + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgePendingText: { color: Colors.gold[500], fontSize: 11, fontWeight: '700' },
  
  cardBody: { padding: Spacing.md },
  wasteImage: { width: '100%', height: 160, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, resizeMode: 'cover' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : Colors.gray[50], padding: Spacing.md, borderRadius: BorderRadius.lg },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  
  notesBox: { marginTop: Spacing.md, padding: Spacing.md, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100], borderRadius: BorderRadius.md, borderLeftWidth: 3, borderLeftColor: Colors.info },
  notesLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  notesText: { fontSize: 13, color: colors.text, fontStyle: 'italic' },
  
  cardFooter: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.lg, gap: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '800' },
});
