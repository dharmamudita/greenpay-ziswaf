import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function VerifyDistrikScreen() {
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
      Alert.alert('Akses Ditolak', 'Hanya Super Admin yang bisa mengakses halaman ini.');
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
      Alert.alert('Error', 'Gagal memuat daftar pengajuan.');
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
        if (Platform.OS === 'web') {
          window.alert(`Pengajuan berhasil di-${status}.`);
        } else {
          Alert.alert('Sukses', `Pengajuan berhasil di-${status}.`);
        }
        fetchData();
      } catch (error) {
        console.log('Error Verify:', error.response?.data || error.message);
        const errMsg = error.response?.data?.error || error.message || 'Unknown error';
        if (Platform.OS === 'web') {
          window.alert(`Gagal memproses verifikasi: ${errMsg}`);
        } else {
          Alert.alert('Error', `Gagal memproses verifikasi: ${errMsg}`);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Apakah Anda yakin ingin ${actionText} pengajuan ini?`)) {
        executeVerify();
      }
    } else {
      Alert.alert(
        'Konfirmasi',
        `Apakah Anda yakin ingin ${actionText} pengajuan ini?`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Ya, Lanjutkan', 
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
          <Text style={[dynamicStyles.tabText, activeTab === 'pending' && dynamicStyles.activeTabText]}>Menunggu ({requests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[dynamicStyles.tabBtn, activeTab === 'history' && dynamicStyles.activeTabBtn]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'history' && dynamicStyles.activeTabText]}>Riwayat</Text>
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
              {activeTab === 'pending' ? 'Tidak ada pengajuan baru' : 'Belum ada riwayat verifikasi'}
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
                      req.status === 'approved' ? {backgroundColor: '#D1FAE5'} : {backgroundColor: '#FEE2E2'}
                    ]}>
                      <Text style={[
                        dynamicStyles.statusText,
                        req.status === 'approved' ? {color: Colors.green[600]} : {color: Colors.error}
                      ]}>
                        {req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={dynamicStyles.divider} />

                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="home" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>Nama Distrik:</Text> {req.name}</Text>
                </View>
                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>Alamat:</Text> {req.address}</Text>
                </View>
                <View style={dynamicStyles.detailRow}>
                  <Ionicons name="call" size={16} color={colors.textMuted} />
                  <Text style={dynamicStyles.detailText}><Text style={{fontWeight:'700'}}>No. HP:</Text> {req.phone}</Text>
                </View>

                {activeTab === 'pending' && (
                  <View style={dynamicStyles.actionRow}>
                    <TouchableOpacity 
                      style={[dynamicStyles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} 
                      onPress={() => handleVerify(req.id, 'rejected')}
                    >
                      <Ionicons name="close" size={20} color={Colors.error} />
                      <Text style={[dynamicStyles.actionBtnText, { color: Colors.error }]}>Tolak</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[dynamicStyles.actionBtn, { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }]} 
                      onPress={() => handleVerify(req.id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={20} color={Colors.green[600]} />
                      <Text style={[dynamicStyles.actionBtnText, { color: Colors.green[600] }]}>Setujui</Text>
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
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16, fontWeight: '500' }
});
