import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VerifyDistrikScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  
  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Akses Ditolak', 'Hanya Super Admin yang bisa mengakses halaman ini.');
      router.back();
      return;
    }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/distrik/admin/requests');
      setRequests(res.data);
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
    fetchRequests();
  };

  const handleVerify = (id, status) => {
    const actionText = status === 'approved' ? 'Setujui' : 'Tolak';
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${actionText} pengajuan ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Lanjutkan', 
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await api.put(`/distrik/admin/requests/${id}`, { status });
              Alert.alert('Sukses', `Pengajuan berhasil di-${status}.`);
              fetchRequests();
            } catch (error) {
              Alert.alert('Error', 'Gagal memproses verifikasi.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={dynamicStyles.centerScreen}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={dynamicStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={dynamicStyles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={dynamicStyles.headerTextWrap}>
          <Text style={dynamicStyles.title}>Verifikasi Distrik</Text>
          <Text style={dynamicStyles.subtitle}>Daftar pengguna yang mengajukan diri.</Text>
        </View>
      </View>
      
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Ionicons name="shield-checkmark" size={60} color={Colors.error} />
      </View>

      {requests.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={60} color={colors.textMuted} />
          <Text style={dynamicStyles.emptyText}>Tidak ada pengajuan baru</Text>
        </View>
      ) : (
        <View style={dynamicStyles.listContainer}>
          {requests.map((req) => (
            <View key={req.id} style={dynamicStyles.card}>
              <View style={dynamicStyles.cardHeader}>
                <Ionicons name="person-circle" size={40} color={colors.textMuted} />
                <View style={dynamicStyles.userInfo}>
                  <Text style={dynamicStyles.userName}>{req.display_name}</Text>
                  <Text style={dynamicStyles.userEmail}>{req.email}</Text>
                </View>
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
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: colors.bg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingRight: 16 },
  detailText: { fontSize: 14, color: colors.text, marginLeft: 8, flex: 1, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 16, fontWeight: '500' }
});
