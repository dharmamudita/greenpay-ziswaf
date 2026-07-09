import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, Button } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RewardScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/green-points/rewards');
      setRewards(res.data);
    } catch (error) {
      console.log('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId, rewardName, cost) => {
    Alert.alert(
      "Konfirmasi Penukaran",
      `Tukar ${cost} GP dengan ${rewardName}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Tukar", 
          onPress: async () => {
            try {
              setRedeeming(rewardId);
              await api.post('/green-points/redeem', { reward_id: rewardId });
              Alert.alert('Berhasil', 'Reward berhasil ditukar! Silakan cek notifikasi Anda.');
              fetchRewards(); // Refresh stock
            } catch (error) {
              console.log('Error redeeming:', error);
              Alert.alert('Gagal', error.response?.data?.error || 'Gagal menukar poin.');
            } finally {
              setRedeeming(null);
            }
          }
        }
      ]
    );
  };

  const getIconForCategory = (category) => {
    switch((category || '').toLowerCase()) {
      case 'voucher': return 'ticket';
      case 'produk': return 'cube';
      case 'lingkungan': return 'leaf';
      case 'merchandise': return 'shirt';
      default: return 'gift';
    }
  };

  const userPoints = user?.green_points || 0;

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.pageTitle}>Katalog Reward</Text>
          <Badge text={`${userPoints.toLocaleString()} GP`} variant="gold" />
        </View>

        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : rewards.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Belum ada reward tersedia.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.grid}>
            {rewards.map((r) => (
              <Card key={r.id} style={dynamicStyles.rewardCard}>
                <View style={dynamicStyles.imgPlaceholder}>
                  <Ionicons name={getIconForCategory(r.category)} size={32} color={Colors.gold[400]} />
                </View>
                <Text style={dynamicStyles.rewardName}>{r.name}</Text>
                <Text style={dynamicStyles.rewardStock}>Sisa: {r.stock}</Text>
                <View style={dynamicStyles.footer}>
                  <Text style={dynamicStyles.costText}>{r.points_cost} GP</Text>
                  <Button 
                    title={redeeming === r.id ? "..." : "Tukar"} 
                    variant="gold" 
                    style={{ paddingHorizontal: Spacing.sm, paddingVertical: 6 }} 
                    textStyle={{ fontSize: 12 }} 
                    disabled={userPoints < r.points_cost || r.stock <= 0 || redeeming === r.id}
                    onPress={() => handleRedeem(r.id, r.name, r.points_cost)} 
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  rewardCard: { width: '48%', gap: Spacing.xs, padding: Spacing.md, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  imgPlaceholder: { height: 80, backgroundColor: colors.surface2, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  rewardName: { fontSize: 13, fontWeight: '700', color: colors.text },
  rewardStock: { fontSize: 10, color: colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  costText: { fontSize: 14, fontWeight: '800', color: Colors.gold[400] },
});
