import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
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
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardHeader}>
        <View style={dynamicStyles.userInfo}>
          <Ionicons name="person-circle" size={24} color={colors.textMuted} />
          <Text style={dynamicStyles.userName}>{item.user_name}</Text>
        </View>
        <Text style={dynamicStyles.date}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
      </View>
      
      <View style={dynamicStyles.cardBody}>
        <View style={dynamicStyles.detailRow}>
          <Text style={dynamicStyles.label}>Jenis Sampah:</Text>
          <Text style={dynamicStyles.value}>{item.waste_type}</Text>
        </View>
        <View style={dynamicStyles.detailRow}>
          <Text style={dynamicStyles.label}>Berat (Kg):</Text>
          <Text style={dynamicStyles.value}>{item.weight_kg} Kg</Text>
        </View>
        <View style={dynamicStyles.detailRow}>
          <Text style={dynamicStyles.label}>Lokasi:</Text>
          <Text style={dynamicStyles.value}>{item.location_name}</Text>
        </View>
      </View>

      <View style={dynamicStyles.cardFooter}>
        <TouchableOpacity 
          style={[dynamicStyles.button, dynamicStyles.buttonReject, processingId === item.id && dynamicStyles.buttonDisabled]} 
          onPress={() => handleVerify(item.id, 'rejected')}
          disabled={processingId === item.id}
        >
          <Ionicons name="close" size={18} color="white" style={dynamicStyles.btnIcon} />
          <Text style={dynamicStyles.buttonText}>Tolak</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[dynamicStyles.button, dynamicStyles.buttonAccept, processingId === item.id && dynamicStyles.buttonDisabled]} 
          onPress={() => handleVerify(item.id, 'verified')}
          disabled={processingId === item.id}
        >
          <Ionicons name="checkmark" size={18} color="white" style={dynamicStyles.btnIcon} />
          <Text style={dynamicStyles.buttonText}>Terima & Beri Poin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isDistrik() && !isAdmin()) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.centerContent}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={dynamicStyles.errorText}>Akses Ditolak. Anda bukan admin/distrik.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Verifikasi Distrik</Text>
        <Text style={dynamicStyles.subtitle}>Antrean Setoran Sampah</Text>
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
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.textMuted} />
              <Text style={dynamicStyles.emptyText}>Semua setoran sudah diverifikasi!</Text>
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
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardBody: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonAccept: {
    backgroundColor: Colors.green[600],
  },
  buttonReject: {
    backgroundColor: Colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  btnIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  }
});
