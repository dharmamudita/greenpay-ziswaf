import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Katalog Reward</Text>
          <Badge text={`${userPoints.toLocaleString()} GP`} variant="gold" />
        </View>

        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : rewards.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="gift-outline" size={48} color={Colors.gray[600]} />
            <Text style={{ color: Colors.gray[500], marginTop: Spacing.md }}>Belum ada reward tersedia.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {rewards.map((r) => (
              <Card key={r.id} style={styles.rewardCard}>
                <View style={styles.imgPlaceholder}>
                  <Ionicons name={getIconForCategory(r.category)} size={32} color={Colors.gold[400]} />
                </View>
                <Text style={styles.rewardName}>{r.name}</Text>
                <Text style={styles.rewardStock}>Sisa: {r.stock}</Text>
                <View style={styles.footer}>
                  <Text style={styles.costText}>{r.points_cost} GP</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  rewardCard: { width: '48%', gap: Spacing.xs, padding: Spacing.md },
  imgPlaceholder: { height: 80, backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  rewardName: { fontSize: 13, fontWeight: '700', color: Colors.white },
  rewardStock: { fontSize: 10, color: Colors.gray[400] },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  costText: { fontSize: 14, fontWeight: '800', color: Colors.gold[400] },
});
