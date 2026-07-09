import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const stats = [
  { icon: 'refresh-circle', value: '12.5K', unit: 'Kg', label: 'Sampah Didaur Ulang', color: Colors.green[500] },
  { icon: 'leaf', value: '1,247', unit: '', label: 'Pohon Ditanam', color: Colors.green[400] },
  { icon: 'heart', value: '2.8M', unit: 'Rp', label: 'Dana ZISWAF', color: Colors.gold[400] },
  { icon: 'storefront', value: '156', unit: '', label: 'UMKM Diberdayakan', color: Colors.info },
];

const features = [
  { icon: 'heart', title: 'Program ZISWAF', desc: 'Bayar zakat, infak, sedekah & wakaf', color: Colors.gold[400], route: '/(tabs)/ziswaf' },
  { icon: 'refresh-circle', title: 'Bank Sampah', desc: 'Setor sampah & dapatkan poin', color: Colors.green[500], route: '/bank-sampah' },
  { icon: 'storefront', title: 'Marketplace', desc: 'Belanja produk ramah lingkungan', color: Colors.info, route: '/(tabs)/marketplace' },
  { icon: 'leaf', title: 'Green Point', desc: 'Kumpulkan & tukar poin', color: Colors.green[400], route: '/(tabs)/green-point' },
  { icon: 'bar-chart', title: 'Dashboard', desc: 'Pantau dampak kontribusi', color: Colors.purple, route: '/dashboard-dampak' },
  { icon: 'document-text', title: 'Impact Passport', desc: 'Paspor digital kontribusi', color: Colors.pink, route: '/impact-passport' },
  { icon: 'gift', title: 'Reward', desc: 'Tukarkan poin dengan hadiah', color: Colors.gold[500], route: '/reward' },
  { icon: 'trophy', title: 'Peringkat', desc: 'Top 10 Pejuang Lingkungan', color: Colors.gold[400], route: '/leaderboard' },
];

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={dynamicStyles.heroContainer}>
        <LinearGradient
          colors={[isDark ? Colors.dark.surface2 : Colors.green[600], isDark ? Colors.dark.bg : Colors.green[800]]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={dynamicStyles.heroContent}>
          <Badge text="🌿 Platform Green Economy" variant="gold" />
          <Text style={dynamicStyles.heroTitle}>
            Bersama Wujudkan{'\n'}
            <Text style={{ color: Colors.green[300] }}>Indonesia Hijau</Text>
          </Text>
          <Text style={dynamicStyles.heroSubtitle}>
            Gabungkan kekuatan ZISWAF dan aksi lingkungan untuk dampak nyata.
          </Text>
          <View style={dynamicStyles.heroBtns}>
            {isAuthenticated ? (
              <Button title="Dashboard Saya" onPress={() => router.push('/dashboard-dampak')} style={{ flex: 1 }} />
            ) : (
              <>
                <Button title="Mulai Sekarang" onPress={() => router.push('/(auth)/register')} style={{ flex: 1 }} />
                <Button title="Masuk" variant="outline" onPress={() => router.push('/(auth)/login')} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} textStyle={{ color: Colors.white }} />
              </>
            )}
          </View>
        </View>
      </View>

      {/* Stats - Overlapping the Hero */}
      <View style={dynamicStyles.statsRow}>
        {stats.map((s, i) => (
          <Card key={i} style={dynamicStyles.statCard}>
            <View style={[dynamicStyles.statIconBox, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
            </View>
            <Text style={[dynamicStyles.statValue, { color: isDark ? Colors.white : Colors.light.text }]}>{s.value}<Text style={dynamicStyles.statUnit}> {s.unit}</Text></Text>
            <Text style={dynamicStyles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Features Grid */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Fitur <Text style={{ color: Colors.green[500] }}>Unggulan</Text></Text>
          <View style={dynamicStyles.featGrid}>
            {features.map((f, i) => (
              <Card key={i} style={dynamicStyles.featCard} onPress={() => router.push(f.route)}>
                <View style={[dynamicStyles.featIcon, { backgroundColor: f.color + '18' }]}>
                  <Ionicons name={f.icon} size={26} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.featTitle}>{f.title}</Text>
                  <Text style={dynamicStyles.featDesc}>{f.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Card>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={dynamicStyles.section}>
          <Card style={dynamicStyles.ctaCard}>
            <LinearGradient colors={[Colors.green[600], Colors.green[800]]} style={StyleSheet.absoluteFillObject} />
            <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
              <View style={dynamicStyles.ctaIconBox}>
                <Ionicons name="earth" size={40} color={Colors.white} />
              </View>
              <Text style={dynamicStyles.ctaTitle}>Siap Membuat Perubahan?</Text>
              <Text style={dynamicStyles.ctaDesc}>Daftar gratis dan dapatkan Impact Passport Anda hari ini.</Text>
              <Button title="Daftar Gratis" variant="gold" onPress={() => router.push('/(auth)/register')} style={{ width: '100%', marginTop: Spacing.md }} />
            </View>
          </Card>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      {/* Floating Action Button untuk Eco-Ustadz AI */}
      <TouchableOpacity 
        style={[dynamicStyles.fab, Shadows.md]} 
        activeOpacity={0.9}
        onPress={() => router.push('/eco-ustadz')}
      >
        <LinearGradient 
          colors={[Colors.green[500], Colors.green[700]]} 
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Ionicons name="chatbubbles" size={28} color={Colors.white} />
        <View style={dynamicStyles.fabSparkle}>
          <Ionicons name="sparkles" size={14} color={Colors.gold[400]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  heroContainer: { 
    paddingTop: Spacing['5xl'], 
    paddingBottom: Spacing['4xl'] + Spacing.xl, 
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    ...Shadows.md
  },
  heroContent: { gap: Spacing.md },
  heroTitle: { fontSize: 34, fontWeight: '900', color: Colors.white, lineHeight: 40, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 24, fontWeight: '500' },
  heroBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },

  statsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: Spacing.lg, 
    gap: Spacing.md, 
    marginTop: -Spacing['4xl'], // Overlap
    zIndex: 10
  },
  statCard: { 
    flex: 1, 
    minWidth: '45%', 
    padding: Spacing.md, 
    alignItems: 'flex-start', 
    gap: 6,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(255,255,255,0.8)',
    backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.95)',
  },
  statIconBox: {
    padding: 8,
    borderRadius: BorderRadius.lg,
    marginBottom: 4,
  },
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statUnit: { fontSize: 13, fontWeight: '600' },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing['3xl'] },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },

  featGrid: { gap: Spacing.md },
  featCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md, 
    gap: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  featIcon: { width: 50, height: 50, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  featTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
  heroTextContent: { paddingHorizontal: Spacing['2xl'], alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: '700', marginLeft: 4, letterSpacing: 0.5 },
  heroTitle: { fontSize: 38, fontWeight: '900', color: Colors.white, textAlign: 'center', lineHeight: 44, marginBottom: Spacing.md, letterSpacing: -1 },
  heroDesc: { fontSize: 16, color: Colors.green[100], textAlign: 'center', lineHeight: 24, marginBottom: Spacing['2xl'], fontWeight: '500' },
  
  fab: { position: 'absolute', bottom: Spacing['2xl'], right: Spacing.xl, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.green[600], alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fabSparkle: { position: 'absolute', top: 12, right: 12 },
});
