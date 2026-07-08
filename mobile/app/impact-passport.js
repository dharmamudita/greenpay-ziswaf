import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';

const badges = [
  { name: 'Eco Warrior', icon: '⚔️', desc: 'Setor 100kg sampah', earned: true },
  { name: 'ZISWAF Hero', icon: '💎', desc: 'Donasi > Rp 1 juta', earned: true },
  { name: 'Tree Planter', icon: '🌳', desc: 'Tanam 10 pohon', earned: true },
  { name: 'Carbon Neutral', icon: '🌍', desc: 'Kurangi 1 ton CO₂', earned: false },
  { name: 'Green Legend', icon: '👑', desc: 'Kumpulkan 5000 GP', earned: false },
];

export default function ImpactPassportScreen() {
  const { user } = useAuth();
  
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Passport Card */}
        <Card style={styles.passportCard}>
          <LinearGradient colors={[Colors.green[800], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.passHeader}>
            <Text style={styles.passTitle}>IMPACT PASSPORT</Text>
            <Ionicons name="leaf" size={24} color={Colors.green[400]} />
          </View>
          
          <View style={styles.passBody}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.white }}>{user?.display_name?.[0] || 'A'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.display_name || 'Ahmad Rizki'}</Text>
              <Text style={styles.id}>ID: GPZ-2025-{user?.id?.substring(0,5) || '8X9A2'}</Text>
              <Badge text="Eco Citizen" variant="gold" style={{ marginTop: 4 }} />
            </View>
          </View>

          <View style={styles.passStats}>
            <View style={styles.passStatItem}>
              <Text style={styles.passStatVal}>120 kg</Text>
              <Text style={styles.passStatLbl}>Sampah</Text>
            </View>
            <View style={styles.passStatItem}>
              <Text style={styles.passStatVal}>1.5 Jt</Text>
              <Text style={styles.passStatLbl}>ZISWAF</Text>
            </View>
            <View style={styles.passStatItem}>
              <Text style={styles.passStatVal}>12</Text>
              <Text style={styles.passStatLbl}>Pohon</Text>
            </View>
          </View>
        </Card>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Pencapaian (Badges)</Text>
        <View style={styles.badgeGrid}>
          {badges.map((b, i) => (
            <Card key={i} style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={[styles.badgeName, !b.earned && { color: Colors.gray[500] }]}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
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
  passportCard: { padding: 0, overflow: 'hidden', borderWidth: 2, borderColor: Colors.green[600], marginBottom: Spacing.xl },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  passTitle: { fontSize: 16, fontWeight: '800', color: Colors.green[400], letterSpacing: 2 },
  passBody: { flexDirection: 'row', padding: Spacing.base, gap: Spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 8, backgroundColor: Colors.green[600], alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  id: { fontSize: 11, color: Colors.green[200], fontFamily: 'monospace' },
  passStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', padding: Spacing.base },
  passStatItem: { flex: 1, alignItems: 'center' },
  passStatVal: { fontSize: 16, fontWeight: '800', color: Colors.white },
  passStatLbl: { fontSize: 10, color: Colors.green[300], marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { width: '31%', padding: Spacing.sm, alignItems: 'center', gap: 4 },
  badgeLocked: { opacity: 0.5, borderColor: Colors.dark.border },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 11, fontWeight: '700', color: Colors.green[400], textAlign: 'center' },
  badgeDesc: { fontSize: 9, color: Colors.gray[400], textAlign: 'center' },
});
