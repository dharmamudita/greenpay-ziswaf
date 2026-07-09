import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DistrikDashboard() {
  const { isDistrik, isAdmin } = useAuth();
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={24} color={Colors.gray[400]} />
          <Text style={styles.userName}>{item.user_name}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Jenis Sampah:</Text>
          <Text style={styles.value}>{item.waste_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Berat (Kg):</Text>
          <Text style={styles.value}>{item.weight_kg} Kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Lokasi:</Text>
          <Text style={styles.value}>{item.location_name}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonReject, processingId === item.id && styles.buttonDisabled]} 
          onPress={() => handleVerify(item.id, 'rejected')}
          disabled={processingId === item.id}
        >
          <Ionicons name="close" size={18} color="white" style={styles.btnIcon} />
          <Text style={styles.buttonText}>Tolak</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.buttonAccept, processingId === item.id && styles.buttonDisabled]} 
          onPress={() => handleVerify(item.id, 'verified')}
          disabled={processingId === item.id}
        >
          <Ionicons name="checkmark" size={18} color="white" style={styles.btnIcon} />
          <Text style={styles.buttonText}>Terima & Beri Poin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isDistrik() && !isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed" size={64} color={Colors.gray[500]} />
          <Text style={styles.errorText}>Akses Ditolak. Anda bukan admin/distrik.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Verifikasi Distrik</Text>
        <Text style={styles.subtitle}>Antrean Setoran Sampah</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.green[500]} />
        </View>
      ) : (
        <FlatList
          data={pendingDeposits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDepositItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.gray[400]} />
              <Text style={styles.emptyText}>Semua setoran sudah diverifikasi!</Text>
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchPendingDeposits}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.gray[400],
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  date: {
    color: Colors.gray[400],
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
    color: Colors.gray[400],
    fontSize: 14,
  },
  value: {
    color: Colors.white,
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
    backgroundColor: Colors.red[600],
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
    color: Colors.gray[400],
    marginTop: 16,
    fontSize: 16,
  }
});
