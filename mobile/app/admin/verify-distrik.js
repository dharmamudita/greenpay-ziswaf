import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function VerifyDistrikScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  
  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert(t('admin.access_denied', {defaultValue: 'Akses Ditolak'}), t('admin.super_admin_only', {defaultValue: 'Hanya Super Admin yang bisa mengakses halaman ini.'}));
      router.back();
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, histRes] = await Promise.all([
        api.get('/distrik/admin/requests'),
        api.get('/distrik/admin/requests/history')
      ]);
      setRequests(reqRes.data);
      setHistory(histRes.data);
    } catch (error) {
      console.log('Error fetching requests:', error);
      Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.load_failed', {defaultValue: 'Gagal memuat daftar pengajuan.'}));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleVerify = async (id, status) => {
    const actionText = status === 'approved' ? 'Setujui' : 'Tolak';
    
    const executeVerify = async () => {
      try {
        await api.put(`/distrik/admin/requests/${id}`, { status });
        const successMsg = t('admin.verify_success', {defaultValue: `Pengajuan berhasil di-${status}.`});
        if (Platform.OS === 'web') {
          window.alert(successMsg);
        } else {
          Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), successMsg);
        }
        fetchData();
      } catch (error) {
        console.log('Error Verify:', error.response?.data || error.message);
        const errMsg = error.response?.data?.error || error.message || t('admin.unknown_error', {defaultValue: 'Unknown error'});
        if (Platform.OS === 'web') {
          window.alert(t('admin.verify_failed', {defaultValue: `Gagal memproses verifikasi: ${errMsg}`}));
        } else {
          Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.verify_failed', {defaultValue: `Gagal memproses verifikasi: ${errMsg}`}));
        }
      }
    };

    const confirmMsg = t('admin.confirm_verify_msg', {defaultValue: `Apakah Anda yakin ingin ${actionText} pengajuan ini?`});

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        executeVerify();
      }
    } else {
      Alert.alert(
        t('admin.confirm', {defaultValue: 'Konfirmasi'}),
        confirmMsg,
        [
          { text: t('admin.cancel', {defaultValue: 'Batal'}), style: 'cancel' },
          { 
            text: t('admin.yes_continue', {defaultValue: 'Ya, Lanjutkan'}), 
            style: status === 'approved' ? 'default' : 'destructive',
            onPress: executeVerify
          }
        ]
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={dynamicStyles.centerScreen}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  const activeData = activeTab === 'pending' ? requests : history;

  return (
    <View style={dynamicStyles.container}>


      {/* Tabs */}
      <View style={dynamicStyles.tabContainer}>
        <TouchableOpacity 
          style={[dynamicStyles.tabBtn, activeTab === 'pending' && dynamicStyles.activeTabBtn]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'pending' && dynamicStyles.activeTabText]}>{t('admin.tab_pending', {defaultValue: 'Menunggu'})} ({requests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[dynamicStyles.tabBtn, activeTab === 'history' && dynamicStyles.activeTabBtn]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'history' && dynamicStyles.activeTabText]}>{t('admin.tab_history', {defaultValue: 'Riwayat'})}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        {activeData.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons name={activeTab === 'pending' ? "checkmark-circle-outline" : "time-outline"} size={60} color={colors.textMuted} />
            <Text style={dynamicStyles.emptyText}>
              {activeTab === 'pending' ? t('admin.no_pending', {defaultValue: 'Tidak ada pengajuan baru'}) : t('admin.no_history', {defaultValue: 'Belum ada riwayat verifikasi'})}
            </Text>
          </View>
        ) : (
          <View style={dynamicStyles.listContainer}>
            {activeData.map((req) => (
              <View key={req.id} style={dynamicStyles.card}>
                <View style={dynamicStyles.cardHeader}>
                  <Ionicons name="person-circle" size={40} color={colors.textMuted} />
                  <View style={dynamicStyles.userInfo}>
                    <Text style={dynamicStyles.userName}>{req.display_name}</Text>
                    <Text style={dynamicStyles.userEmail}>{req.email}</Text>
                  </View>
                  {activeTab === 'history' && (
                    <View style={[
                      dynamicStyles.statusBadge, 
                      req.status === 'approved' ? dynamicStyles.statusApproved : dynamicStyles.statusRejected
                    ]}>
                      <Text style={dynamicStyles.statusText}>
                        {req.status === 'approved' ? t('admin.approved', {defaultValue: 'Disetujui'}) : t('admin.rejected', {defaultValue: 'Ditolak'})}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={dynamicStyles.divider} />

                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="home" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>{t('admin.district_name', {defaultValue: 'Nama Distrik:'})}</Text> {req.name}</Text>
                </View>
                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>{t('admin.address', {defaultValue: 'Alamat:'})}</Text> {req.address}</Text>
                </View>
                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="call" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>{t('admin.phone', {defaultValue: 'No. HP:'})}</Text> {req.phone}</Text>
                </View>

                {activeTab === 'pending' && (
                  <View style={dynamicStyles.actionRow}>
                    <TouchableOpacity 
                      style={[dynamicStyles.actionBtn, { backgroundColor: Colors.error, borderColor: Colors.error }]} 
                      onPress={() => handleVerify(req.id, 'rejected')}
                    >
                      <Ionicons name="close" size={20} color={Colors.white} />
                      <Text style={dynamicStyles.btnText}>{t('admin.reject', {defaultValue: 'Tolak'})}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[dynamicStyles.actionBtn, dynamicStyles.approveBtn]} 
                      onPress={() => handleVerify(req.id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={20} color={Colors.white} />
                      <Text style={dynamicStyles.btnText}>{t('admin.approve', {defaultValue: 'Setujui'})}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },

  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: { borderBottomColor: Colors.green[500] },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  activeTabText: { color: Colors.green[500], fontWeight: '800' },

  listContainer: { padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800' },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingRight: 16 },
  detailText: { fontSize: 14, color: colors.text, marginLeft: 8, flex: 1, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  approveBtn: { backgroundColor: Colors.green[600], borderColor: Colors.green[600] },
  btnText: { fontWeight: '700', fontSize: 14, color: Colors.white },
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  statusApproved: { backgroundColor: '#D1FAE5' },
  statusRejected: { backgroundColor: '#FEE2E2' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16, fontWeight: '500' }
});
