import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import api from '../../services/api';

export default function DepositHistoryScreen() {
  const { colors, isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/distrik/history');
      setHistory(res.data);
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.info} />
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return Colors.green[500];
      case 'rejected': return Colors.error;
      default: return Colors.gold[500];
    }
  };

  return (
    <View style={dynamicStyles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.info} />}
      >
        <View style={dynamicStyles.container}>
          
          <Text style={dynamicStyles.title}>Riwayat Setoran</Text>
          <Text style={dynamicStyles.subtitle}>Daftar aktivitas pengguna yang telah menyetor sampah di lokasi bank sampah Anda.</Text>

          {history.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="documents-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: 12 }}>Belum ada riwayat setoran.</Text>
            </View>
          ) : (
            <View style={dynamicStyles.list}>
              {history.map((item, idx) => {
                const statColor = getStatusColor(item.status);
                return (
                  <View key={item.id || idx} style={dynamicStyles.card}>
                    <View style={dynamicStyles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.user_photo ? (
                          <Image source={{ uri: item.user_photo }} style={dynamicStyles.avatar} />
                        ) : (
                          <View style={[dynamicStyles.avatar, { backgroundColor: Colors.info + '30', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="person" size={16} color={Colors.info} />
                          </View>
                        )}
                        <Text style={dynamicStyles.userName}>{item.user_name}</Text>
                      </View>
                      <View style={[dynamicStyles.statusBadge, { backgroundColor: statColor + '20' }]}>
                        <Text style={[dynamicStyles.statusText, { color: statColor }]}>
                          {(item.status || 'PENDING').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={dynamicStyles.cardBody}>
                      <View style={dynamicStyles.infoCol}>
                        <Text style={dynamicStyles.infoLabel}>Jenis Sampah</Text>
                        <Text style={[dynamicStyles.infoValue, {textTransform: 'capitalize', color: colors.text}]}>{item.waste_type || '-'}</Text>
                      </View>
                      <View style={dynamicStyles.infoCol}>
                        <Text style={dynamicStyles.infoLabel}>Berat</Text>
                        <Text style={[dynamicStyles.infoValue, { color: colors.text }]}>{parseFloat(item.weight_kg || 0)} Kg</Text>
                      </View>
                      <View style={dynamicStyles.infoCol}>
                        <Text style={dynamicStyles.infoLabel}>Green Point</Text>
                        <Text style={[dynamicStyles.infoValue, { color: Colors.gold[500] }]}>+{item.points_earned || 0} pts</Text>
                      </View>
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
  
  list: { gap: Spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  userName: { fontSize: 14, fontWeight: '700', color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: '900' },
  
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : Colors.gray[50], padding: Spacing.md, borderRadius: BorderRadius.lg },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '800' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
});
