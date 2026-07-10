import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function DashboardDampakScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/impact/dashboard');
      setStats(res.data.stats);
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmtWaste = (kg) => {
    if (!kg) return { v: '0', u: 'kg' };
    if (kg >= 1000) return { v: (kg / 1000).toFixed(1), u: 'Ton' };
    return { v: kg, u: 'kg' };
  };

  const fmtMoney = (rp) => {
    if (!rp) return { v: '0', u: '' };
    if (rp >= 1000000) return { v: (rp / 1000000).toFixed(1), u: 'Jt' };
    if (rp >= 1000) return { v: (rp / 1000).toFixed(1), u: 'Rb' };
    return { v: rp, u: '' };
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  const waste = fmtWaste(stats?.total_waste_kg);
  const money = fmtMoney(stats?.total_donation);
  const co2 = fmtWaste(stats?.total_co2_reduced);

  const impactData = [
    { icon: 'people', value: stats?.total_users || 0, label: 'Pengguna Aktif', color: Colors.info, gradient: [Colors.info, '#3B82F6'] },
    { icon: 'refresh', value: waste.v, unit: waste.u, label: 'Total Sampah', color: Colors.green[500], gradient: [Colors.green[400], Colors.green[600]] },
    { icon: 'heart', value: money.v, unit: money.u, label: 'Dana Terkumpul', color: Colors.gold[400], gradient: [Colors.gold[400], Colors.gold[600]] },
    { icon: 'leaf', value: stats?.total_trees || 0, label: 'Pohon Ditanam', color: Colors.green[400], gradient: [Colors.green[300], Colors.green[500]] },
    { icon: 'cloud', value: co2.v, unit: co2.u, label: 'CO₂ Dikurangi', color: isDark ? Colors.gray[300] : Colors.gray[500], gradient: [Colors.gray[400], Colors.gray[600]] },
    { icon: 'storefront', value: stats?.total_umkm || 0, label: 'UMKM Hijau', color: Colors.purple, gradient: ['#A855F7', '#7E22CE'] },
  ];

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Sci-Fi Premium Header (Hero Section) */}
      <View style={dynamicStyles.heroSection}>
        <LinearGradient 
          colors={isDark ? ['#022C22', '#064E3B', colors.bg] : [Colors.green[800], Colors.green[600], colors.bg]}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Background Grid Lines (Sci-Fi touch) */}
        <View style={dynamicStyles.gridLines} />

        {/* Glowing Globe */}
        <View style={dynamicStyles.globeContainer}>
          <View style={dynamicStyles.globeGlow} />
          <Ionicons name="earth" size={140} color="rgba(255,255,255,0.15)" style={{ position: 'absolute' }} />
          <Ionicons name="leaf" size={64} color={Colors.gold[400]} />
        </View>

        <Text style={dynamicStyles.heroSub}>LAPORAN DAMPAK GLOBAL</Text>
        <Text style={dynamicStyles.heroTitle}>{co2.v} <Text style={{ fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>{co2.u}</Text></Text>
        <Text style={dynamicStyles.heroDesc}>Emisi Karbon (CO₂) Berhasil Dicegah</Text>

      </View>

      <View style={dynamicStyles.container}>
        
        {/* Glassmorphism Data Widgets */}
        <View style={dynamicStyles.grid}>
          {impactData.map((item, i) => (
            <View key={i} style={dynamicStyles.statCardWrap}>
              <LinearGradient 
                colors={isDark ? [colors.surface, 'rgba(255,255,255,0.02)'] : [Colors.white, 'rgba(255,255,255,0.6)']} 
                style={dynamicStyles.statCard}
              >
                {/* Glow ring behind icon */}
                <View style={[dynamicStyles.iconRing, { backgroundColor: item.color + '15' }]}>
                  <View style={dynamicStyles.iconWrap}>
                    <LinearGradient colors={item.gradient} style={StyleSheet.absoluteFillObject} />
                    <Ionicons name={item.icon} size={20} color={Colors.white} />
                  </View>
                </View>
                
                <View style={{ marginTop: Spacing.sm }}>
                  <Text style={[dynamicStyles.statValue, { color: colors.text }]}>{item.value} <Text style={dynamicStyles.statUnit}>{item.unit || ''}</Text></Text>
                  <Text style={dynamicStyles.statLabel}>{item.label}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Executive Chart Module */}
        <View style={dynamicStyles.chartCard}>
          <LinearGradient 
            colors={isDark ? [colors.surface, colors.bg] : [Colors.white, Colors.gray[50]]} 
            style={StyleSheet.absoluteFillObject}
          />
          <View style={dynamicStyles.chartHeader}>
            <View>
              <Text style={dynamicStyles.chartTitle}>Tren Penyelamatan Bumi</Text>
              <Text style={dynamicStyles.chartSubtitle}>Akumulasi 30 hari terakhir</Text>
            </View>
            <View style={dynamicStyles.chartIconBox}>
              <Ionicons name="pulse" size={24} color={Colors.green[500]} />
            </View>
          </View>
          
          <View style={dynamicStyles.chartPlaceholder}>
            <LinearGradient 
              colors={[Colors.green[500] + '10', 'transparent']} 
              style={StyleSheet.absoluteFillObject}
            />
            {/* Fake Chart Lines */}
            <View style={dynamicStyles.fakeChartLineWrapper}>
              {[20, 35, 30, 50, 45, 70, 85, 100].map((h, i) => (
                <View key={i} style={[dynamicStyles.fakeChartBar, { height: `${h}%`, backgroundColor: Colors.green[500] }]} />
              ))}
            </View>
            <View style={dynamicStyles.chartOverlayText}>
              <Ionicons name="lock-closed" size={16} color={Colors.gold[500]} style={{ marginBottom: 4 }} />
              <Text style={dynamicStyles.chartOverlayLabel}>Visualisasi Detail Segera Hadir</Text>
            </View>
          </View>
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl, marginTop: -40 },
  
  // Hero Section
  heroSection: {
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    borderWidth: 1,
    borderColor: Colors.white,
    borderStyle: 'dashed',
    margin: 20,
    borderRadius: 40,
  },
  globeContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  globeGlow: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.green[400],
    opacity: 0.2,
    filter: 'blur(20px)',
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.gold[400],
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -2,
    marginBottom: -4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  heroDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Data Grid Widgets
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCardWrap: { 
    width: '47.5%', 
    borderRadius: BorderRadius['2xl'], 
    ...Shadows.md,
    shadowColor: isDark ? Colors.black : Colors.green[900],
    shadowOpacity: isDark ? 0.3 : 0.05,
  },
  statCard: { 
    padding: Spacing.lg, 
    borderRadius: BorderRadius['2xl'], 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  iconRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden',
  },
  statValue: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  statUnit: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Executive Chart Module
  chartCard: { 
    marginTop: Spacing['2xl'], 
    borderRadius: BorderRadius['2xl'], 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.lg,
    shadowOpacity: isDark ? 0.1 : 0.05,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  chartTitle: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  chartSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  chartIconBox: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: { 
    height: 200, 
    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : Colors.white, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  fakeChartLineWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    height: '100%',
    width: '100%',
    opacity: 0.2,
  },
  fakeChartBar: {
    width: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartOverlayText: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
  },
  chartOverlayLabel: {
    color: isDark ? Colors.gold[400] : Colors.gold[600],
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
