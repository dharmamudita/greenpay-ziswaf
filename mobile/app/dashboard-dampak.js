import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

export default function DashboardDampakScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();

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
      <LinearGradient 
        colors={[isDark ? Colors.dark.surface2 : Colors.green[50], colors.bg]} 
        style={dynamicStyles.headerGradient}
      >
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.pageTitle}>Dashboard Dampak Global</Text>
          <Text style={dynamicStyles.pageDesc}>Melihat seberapa besar perubahan yang kita buat bersama untuk masa depan bumi dan kesejahteraan umat.</Text>

          <View style={dynamicStyles.grid}>
            {impactData.map((item, i) => (
              <Card key={i} style={dynamicStyles.statCard}>
                <LinearGradient colors={isDark ? [item.color + '20', item.color + '05'] : [item.color + '15', item.color + '05']} style={StyleSheet.absoluteFillObject} />
                <View style={[dynamicStyles.iconWrap, Shadows.sm]}>
                  <LinearGradient colors={item.gradient} style={StyleSheet.absoluteFillObject} />
                  <Ionicons name={item.icon} size={22} color={Colors.white} />
                </View>
                <Text style={[dynamicStyles.statValue, { color: isDark ? Colors.white : Colors.light.text }]}>{item.value} <Text style={dynamicStyles.statUnit}>{item.unit || ''}</Text></Text>
                <Text style={dynamicStyles.statLabel}>{item.label}</Text>
              </Card>
            ))}
          </View>

          <Card style={dynamicStyles.chartCard}>
            <View style={dynamicStyles.chartHeader}>
              <View>
                <Text style={dynamicStyles.chartTitle}>Tren Pengurangan Emisi CO₂</Text>
                <Text style={dynamicStyles.chartSubtitle}>Secara kumulatif (dalam ton)</Text>
              </View>
              <Ionicons name="bar-chart" size={24} color={Colors.green[500]} />
            </View>
            <View style={dynamicStyles.chartPlaceholder}>
              <Ionicons name="analytics-outline" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
              <Text style={{ color: colors.textMuted, marginTop: Spacing.sm, fontWeight: '500' }}>Grafik visualisasi dampak akan segera hadir</Text>
            </View>
          </Card>
        </View>
        <View style={{ height: Spacing['3xl'] }} />
      </LinearGradient>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerGradient: { minHeight: '100%' },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 14, color: colors.textMuted, marginBottom: Spacing['2xl'], marginTop: Spacing.sm, lineHeight: 22 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { 
    width: '47.5%', 
    alignItems: 'flex-start', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius['2xl'], 
    borderWidth: 1, 
    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  iconWrap: { 
    width: 44, 
    height: 44, 
    borderRadius: BorderRadius.xl, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statUnit: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  
  chartCard: { 
    marginTop: Spacing['2xl'], 
    borderRadius: BorderRadius['2xl'], 
    borderWidth: 1, 
    borderColor: colors.border,
    padding: Spacing.lg,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  chartTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  chartSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chartPlaceholder: { 
    height: 220, 
    backgroundColor: isDark ? colors.surface2 : Colors.gray[100], 
    borderRadius: BorderRadius.xl, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
});
