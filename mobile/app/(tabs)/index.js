import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const stats = [
  { icon: 'refresh-circle', value: '12.5K', unit: 'Kg', label: 'Sampah Didaur Ulang', color: Colors.green[500] },
  { icon: 'leaf', value: '1,247', unit: '', label: 'Pohon Ditanam', color: Colors.green[300] },
  { icon: 'heart', value: '2.8M', unit: 'Rp', label: 'Dana ZISWAF', color: Colors.gold[400] },
  { icon: 'storefront', value: '156', unit: '', label: 'UMKM Diberdayakan', color: Colors.info },
];

const features = [
  { icon: 'heart', title: 'Program ZISWAF', desc: 'Bayar zakat, infak, sedekah & wakaf', color: Colors.gold[400], route: '/(tabs)/ziswaf' },
  { icon: 'refresh-circle', title: 'Bank Sampah', desc: 'Setor sampah & dapatkan poin', color: Colors.green[500], route: '/bank-sampah' },
  { icon: 'storefront', title: 'Marketplace', desc: 'Belanja produk ramah lingkungan', color: Colors.info, route: '/(tabs)/marketplace' },
  { icon: 'leaf', title: 'Green Point', desc: 'Kumpulkan & tukar poin', color: Colors.green[300], route: '/(tabs)/green-point' },
  { icon: 'bar-chart', title: 'Dashboard', desc: 'Pantau dampak kontribusi', color: Colors.purple, route: '/dashboard-dampak' },
  { icon: 'document-text', title: 'Impact Passport', desc: 'Paspor digital kontribusi', color: Colors.pink, route: '/impact-passport' },
  { icon: 'gift', title: 'Reward', desc: 'Tukarkan poin dengan hadiah', color: Colors.gold[500], route: '/reward' },
  { icon: 'trophy', title: 'Peringkat', desc: 'Top 10 Pejuang Lingkungan', color: Colors.gold[400], route: '/leaderboard' },
];

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.green[900], Colors.dark.bg]}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Badge text="🌿 Platform Green Economy" />
          <Text style={styles.heroTitle}>
            Bersama Wujudkan{'\n'}
            <Text style={{ color: Colors.green[400] }}>Indonesia Hijau</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Gabungkan kekuatan ZISWAF dan aksi lingkungan untuk dampak nyata.
          </Text>
          <View style={styles.heroBtns}>
            {isAuthenticated ? (
              <Button title="Dashboard Saya" onPress={() => router.push('/dashboard-dampak')} />
            ) : (
              <>
                <Button title="Mulai Sekarang" onPress={() => router.push('/(auth)/register')} />
                <Button title="Masuk" variant="outline" onPress={() => router.push('/(auth)/login')} />
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Ionicons name={s.icon} size={22} color={s.color} />
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}<Text style={styles.statUnit}> {s.unit}</Text></Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitur <Text style={{ color: Colors.green[400] }}>Unggulan</Text></Text>
        <View style={styles.featGrid}>
          {features.map((f, i) => (
            <TouchableOpacity key={i} style={styles.featCard} onPress={() => router.push(f.route)} activeOpacity={0.7}>
              <View style={[styles.featIcon, { backgroundColor: f.color + '18' }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <Text style={styles.featTitle}>{f.title}</Text>
              <Text style={styles.featDesc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.section}>
        <Card style={styles.ctaCard}>
          <LinearGradient colors={[Colors.green[800], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="earth" size={40} color={Colors.green[400]} />
            <Text style={styles.ctaTitle}>Siap Membuat Perubahan?</Text>
            <Text style={styles.ctaDesc}>Daftar gratis dan dapatkan Impact Passport Anda hari ini.</Text>
            <Button title="Daftar Gratis" variant="gold" onPress={() => router.push('/(auth)/register')} />
          </View>
        </Card>
      </View>

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  hero: { paddingTop: Spacing['5xl'], paddingBottom: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  heroContent: { gap: Spacing.md },
  heroTitle: { fontSize: 30, fontWeight: '800', color: Colors.white, lineHeight: 38 },
  heroSubtitle: { fontSize: 15, color: Colors.gray[400], lineHeight: 22 },
  heroBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginTop: -Spacing.lg },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statUnit: { fontSize: 12, fontWeight: '500' },
  statLabel: { fontSize: 10, color: Colors.gray[500], textAlign: 'center' },

  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'] },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: Spacing.base },

  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  featCard: { width: '48%', backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.base, gap: Spacing.sm },
  featIcon: { width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  featTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  featDesc: { fontSize: 11, color: Colors.gray[500], lineHeight: 16 },

  ctaCard: { overflow: 'hidden', borderWidth: 0, padding: 0 },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, textAlign: 'center', marginTop: Spacing.md },
  ctaDesc: { fontSize: 13, color: Colors.green[200], textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
});
