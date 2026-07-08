import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

const rewards = [
  { id: 1, name: 'Voucher Belanja Rp 50K', cost: 500, stock: 15, emoji: '🎟️' },
  { id: 2, name: 'Tumbler Eco Premium', cost: 800, stock: 8, emoji: '🥤' },
  { id: 3, name: 'Bibit Pohon Mangga', cost: 200, stock: 50, emoji: '🌱' },
  { id: 4, name: 'Donasi 5 Pohon', cost: 300, stock: 100, emoji: '🌳' },
  { id: 5, name: 'Kaos GreenPay', cost: 1000, stock: 5, emoji: '👕' },
];

export default function RewardScreen() {
  const userPoints = 1247;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Katalog Reward</Text>
          <Badge text={`${userPoints} GP`} variant="gold" />
        </View>

        <View style={styles.grid}>
          {rewards.map((r) => (
            <Card key={r.id} style={styles.rewardCard}>
              <View style={styles.imgPlaceholder}><Text style={{ fontSize: 32 }}>{r.emoji}</Text></View>
              <Text style={styles.rewardName}>{r.name}</Text>
              <Text style={styles.rewardStock}>Sisa: {r.stock}</Text>
              <View style={styles.footer}>
                <Text style={styles.costText}>{r.cost} GP</Text>
                <Button 
                  title="Tukar" 
                  variant="gold" 
                  style={{ paddingHorizontal: Spacing.sm, paddingVertical: 6 }} 
                  textStyle={{ fontSize: 12 }} 
                  disabled={userPoints < r.cost}
                  onPress={() => {}} 
                />
              </View>
            </Card>
          ))}
        </View>
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
