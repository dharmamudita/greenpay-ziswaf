import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

const activities = [
  { action: 'Setor Sampah Plastik 5kg', points: '+50 GP', time: '2 jam lalu', icon: 'refresh-circle' },
  { action: 'Donasi Infak Pendidikan', points: '+25 GP', time: '5 jam lalu', icon: 'heart' },
  { action: 'Belanja Tumbler Bambu', points: '+15 GP', time: '1 hari lalu', icon: 'cart' },
  { action: 'Login Harian', points: '+2 GP', time: '1 hari lalu', icon: 'log-in' },
];

const leaderboard = [
  { rank: 1, name: 'Ahmad Rizki', points: 2450, medal: '🥇' },
  { rank: 2, name: 'Siti Nurhaliza', points: 2180, medal: '🥈' },
  { rank: 3, name: 'Budi Santoso', points: 1950, medal: '🥉' },
  { rank: 4, name: 'Dewi Lestari', points: 1720, medal: '4' },
  { rank: 5, name: 'Eko Prasetyo', points: 1580, medal: '5' },
];

export default function GreenPointScreen() {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={[Colors.green[800], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.balanceContent}>
            <Ionicons name="leaf" size={36} color={Colors.green[400]} />
            <Text style={styles.balanceLabel}>Saldo Green Point</Text>
            <Text style={styles.balanceValue}>1,247</Text>
            <Text style={styles.balanceSub}>Setara pengurangan 31.2 kg CO₂</Text>
            <View style={styles.balanceBtns}>
              <Button title="Tukar Reward" variant="gold" onPress={() => {}} />
              <Button title="Riwayat" variant="outline" onPress={() => {}} />
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="flame" size={18} color={Colors.gold[400]} /> Aktivitas Terbaru
        </Text>
        {activities.map((act, i) => (
          <Card key={i} style={styles.activityCard}>
            <Ionicons name={act.icon} size={22} color={Colors.green[400]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actAction}>{act.action}</Text>
              <Text style={styles.actTime}>{act.time}</Text>
            </View>
            <Badge text={act.points} />
          </Card>
        ))}

        {/* Leaderboard */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          <Ionicons name="trophy" size={18} color={Colors.gold[400]} /> Leaderboard
        </Text>
        {leaderboard.map((user, i) => (
          <Card key={i} style={styles.leaderCard}>
            <Text style={styles.leaderMedal}>{user.medal}</Text>
            <Text style={[styles.actAction, { flex: 1 }]}>{user.name}</Text>
            <Text style={styles.leaderPoints}>{user.points.toLocaleString()} GP</Text>
          </Card>
        ))}
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
  leaderCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md },
  leaderMedal: { fontSize: 20, width: 30, textAlign: 'center' },
  leaderPoints: { color: Colors.green[400], fontWeight: '800', fontSize: 14 },
});
