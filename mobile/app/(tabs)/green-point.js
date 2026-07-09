import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function GreenPointScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/green-points/history');
      setHistory(res.data);
    } catch (error) {
      console.log('Error fetching GP history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForSource = (source) => {
    switch(source) {
      case 'waste_deposit': return 'refresh-circle';
      case 'donation': return 'heart';
      case 'purchase': return 'cart';
      case 'reward': return 'gift';
      default: return 'leaf';
    }
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={[Colors.green[800], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.balanceContent}>
            <Ionicons name="leaf" size={36} color={Colors.green[400]} />
            <Text style={styles.balanceLabel}>Saldo Green Point</Text>
            <Text style={styles.balanceValue}>{user?.green_points?.toLocaleString() || 0}</Text>
            <Text style={styles.balanceSub}>Ayo kumpulkan lebih banyak poin!</Text>
            <View style={styles.balanceBtns}>
              <Button title="Tukar Reward" variant="gold" onPress={() => router.push('/reward')} />
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="flame" size={18} color={Colors.gold[400]} /> Aktivitas Terbaru
        </Text>
        
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : history.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="receipt-outline" size={48} color={Colors.gray[600]} />
            <Text style={{ color: Colors.gray[500], marginTop: Spacing.md }}>Belum ada aktivitas poin.</Text>
          </View>
        ) : (
          history.map((act) => (
            <Card key={act.id} style={styles.activityCard}>
              <Ionicons name={getIconForSource(act.source)} size={22} color={Colors.green[400]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actAction}>{act.description}</Text>
                <Text style={styles.actTime}>{formatTime(act.created_at)}</Text>
              </View>
              <Badge 
                text={`${act.type === 'earn' ? '+' : '-'}${act.points} GP`} 
                variant={act.type === 'earn' ? 'primary' : 'outline'}
              />
            </Card>
          ))
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  balanceCard: { borderRadius: BorderRadius['2xl'], overflow: 'hidden', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.green[700] },
  balanceContent: { padding: Spacing.xl, alignItems: 'center' },
  balanceLabel: { color: Colors.green[300], fontSize: 13, fontWeight: '600', marginTop: Spacing.sm },
  balanceValue: { fontSize: 48, fontWeight: '800', color: Colors.white },
  balanceSub: { color: Colors.green[300], fontSize: 12, marginBottom: Spacing.lg },
  balanceBtns: { flexDirection: 'row', gap: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md },
  actAction: { fontSize: 13, fontWeight: '600', color: Colors.white },
  actTime: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
});
