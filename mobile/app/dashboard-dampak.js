import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
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
    { icon: 'people', value: stats?.total_users || 0, label: 'Pengguna Aktif', color: Colors.info },
    { icon: 'refresh', value: waste.v, unit: waste.u, label: 'Total Sampah', color: Colors.green[500] },
    { icon: 'heart', value: money.v, unit: money.u, label: 'Dana Terkumpul', color: Colors.gold[400] },
    { icon: 'leaf', value: stats?.total_trees || 0, label: 'Pohon Ditanam', color: Colors.green[300] },
    { icon: 'cloud', value: co2.v, unit: co2.u, label: 'CO₂ Dikurangi', color: isDark ? Colors.gray[300] : Colors.gray[500] },
    { icon: 'storefront', value: stats?.total_umkm || 0, label: 'UMKM Hijau', color: Colors.purple },
  ];

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.pageTitle}>Dashboard Dampak Global</Text>
        <Text style={dynamicStyles.pageDesc}>Melihat seberapa besar perubahan yang kita buat bersama.</Text>

        <View style={dynamicStyles.grid}>
          {impactData.map((item, i) => (
            <Card key={i} style={dynamicStyles.statCard}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[dynamicStyles.statValue, { color: item.color }]}>{item.value} <Text style={dynamicStyles.statUnit}>{item.unit || ''}</Text></Text>
              <Text style={dynamicStyles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={dynamicStyles.chartCard}>
          <Text style={dynamicStyles.chartTitle}>Tren Pengurangan Emisi CO₂</Text>
          <View style={dynamicStyles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.sm }}>Grafik akan dimuat di sini</Text>
          </View>
        </Card>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  pageDesc: { fontSize: 13, color: colors.textMuted, marginBottom: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '48%', alignItems: 'center', padding: Spacing.lg, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: 24, fontWeight: '800' },
  statUnit: { fontSize: 14, fontWeight: '600' },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  chartCard: { marginTop: Spacing.lg, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  chartPlaceholder: { height: 200, backgroundColor: colors.surface2, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
});
