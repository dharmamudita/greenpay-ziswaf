import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function DistrikDashboard() {
  const { isDistrik, isAdmin } = useAuth();
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    if (isDistrik() || isAdmin()) {
      fetchPendingDeposits();
    }
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/waste/pending');
      setPendingDeposits(response.data);
    } catch (error) {
      console.log('Error fetching pending deposits:', error);
      Alert.alert('Error', 'Gagal memuat antrean setoran sampah.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      setProcessingId(id);
      await api.put(`/waste/verify/${id}`, { status });
      Alert.alert('Sukses', `Setoran berhasil ${status === 'verified' ? 'diterima' : 'ditolak'}`);
      fetchPendingDeposits();
    } catch (error) {
      console.log('Error verifying deposit:', error);
      Alert.alert('Error', 'Gagal memproses setoran.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderDepositItem = ({ item }) => (
    <View style={dynamicStyles.ticketCard}>
      {/* Top Section */}
      <View style={dynamicStyles.ticketHeader}>
        <View style={dynamicStyles.userInfoRow}>
          <View style={dynamicStyles.avatarBox}>
            <Ionicons name="person" size={16} color={Colors.white} />
          </View>
          <View>
            <Text style={dynamicStyles.userName}>{item.user_name}</Text>
            <Text style={dynamicStyles.date}>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>
        <View style={dynamicStyles.statusBadge}>
          <Text style={dynamicStyles.statusBadgeText}>Menunggu</Text>
        </View>
      </View>
      
      {/* Divider */}
      <View style={dynamicStyles.dividerRow}>
        <View style={dynamicStyles.circleCutLeft} />
        <View style={dynamicStyles.dashedLine} />
        <View style={dynamicStyles.circleCutRight} />
      </View>

      {/* Body Section */}
      <View style={dynamicStyles.ticketBody}>
        <View style={dynamicStyles.detailCol}>
          <Text style={dynamicStyles.label}>Jenis Sampah</Text>
          <Text style={dynamicStyles.value}>{item.waste_type}</Text>
        </View>
        <View style={dynamicStyles.detailColRight}>
          <Text style={dynamicStyles.label}>Berat</Text>
          <Text style={dynamicStyles.valueWeight}>{item.weight_kg} Kg</Text>
        </View>
      </View>
      
      <View style={dynamicStyles.ticketLocation}>
        <Ionicons name="location-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
        <Text style={dynamicStyles.locationText}>{item.location_name}</Text>
      </View>

      {/* Footer / Actions */}
      <View style={dynamicStyles.ticketFooter}>
        <TouchableOpacity 
          style={[dynamicStyles.actionBtn, dynamicStyles.rejectBtn, processingId === item.id && dynamicStyles.btnDisabled]} 
          onPress={() => handleVerify(item.id, 'rejected')}
          disabled={processingId === item.id}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.rejectBtnText}>Tolak</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[dynamicStyles.actionBtn, dynamicStyles.acceptBtn, processingId === item.id && dynamicStyles.btnDisabled]} 
          onPress={() => handleVerify(item.id, 'verified')}
          disabled={processingId === item.id}
          activeOpacity={0.7}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="white" style={{ marginRight: 6 }} />
              <Text style={dynamicStyles.acceptBtnText}>Terima & Beri Poin</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isDistrik() && !isAdmin()) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.accessDeniedContainer}>
          <View style={dynamicStyles.lockIconBox}>
            <Ionicons name="lock-closed" size={48} color={Colors.white} />
          </View>
          <Text style={dynamicStyles.accessTitle}>Akses Ditolak</Text>
          <Text style={dynamicStyles.accessDesc}>Halaman ini khusus untuk Petugas Distrik dan Admin.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Dashboard Admin</Text>
        <Text style={dynamicStyles.subtitle}>Verifikasi Antrean Setoran Sampah</Text>
      </View>

      {loading ? (
        <View style={dynamicStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.green[500]} />
        </View>
      ) : (
        <FlatList
          data={pendingDeposits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDepositItem}
          contentContainerStyle={dynamicStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <View style={dynamicStyles.emptyIconWrap}>
                <Ionicons name="checkmark-done" size={64} color={Colors.green[500]} />
              </View>
              <Text style={dynamicStyles.emptyTitle}>Kerja Bagus!</Text>
              <Text style={dynamicStyles.emptyText}>Semua antrean setoran sampah sudah bersih diverifikasi.</Text>
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchPendingDeposits}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Access Denied
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  lockIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  accessTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  accessDesc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },

  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  
  // E-Ticket Style Card
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Shadows.md,
    shadowOpacity: 0.05,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: isDark ? colors.surface2 : Colors.green[50],
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: Colors.gold[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // Divider with circle cutouts
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: isDark ? colors.border : Colors.gray[200],
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  circleCutLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg,
    position: 'absolute',
    left: -10,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  circleCutRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg,
    position: 'absolute',
    right: -10,
    borderLeftWidth: 1,
    borderColor: colors.border,
  },

  ticketBody: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  detailCol: {
    flex: 1,
  },
  detailColRight: {
    alignItems: 'flex-end',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  valueWeight: {
    color: Colors.green[600],
    fontSize: 18,
    fontWeight: '800',
  },
  ticketLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  locationText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },

  ticketFooter: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectBtnText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: Colors.green[500],
  },
  acceptBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});
