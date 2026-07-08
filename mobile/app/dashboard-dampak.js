import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

const impactData = [
  { icon: 'people', value: '1,200+', label: 'Pengguna Aktif', color: Colors.info },
  { icon: 'refresh', value: '5.2', unit: 'Ton', label: 'Total Sampah', color: Colors.green[500] },
  { icon: 'heart', value: '150+', unit: 'Jt', label: 'Dana Terkumpul', color: Colors.gold[400] },
  { icon: 'leaf', value: '3,450', label: 'Pohon Ditanam', color: Colors.green[300] },
  { icon: 'cloud', value: '12.5', unit: 'Ton', label: 'CO₂ Dikurangi', color: Colors.gray[300] },
  { icon: 'storefront', value: '45', label: 'UMKM Hijau', color: Colors.purple },
];

export default function DashboardDampakScreen() {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Dashboard Dampak Global</Text>
        <Text style={styles.pageDesc}>Melihat seberapa besar perubahan yang kita buat bersama.</Text>

        <View style={styles.grid}>
          {impactData.map((item, i) => (
            <Card key={i} style={styles.statCard}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value} <Text style={styles.statUnit}>{item.unit}</Text></Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tren Pengurangan Emisi CO₂</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={Colors.gray[600]} />
            <Text style={{ color: Colors.gray[500], marginTop: Spacing.sm }}>Grafik akan dimuat di sini</Text>
          </View>
        </Card>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  pageDesc: { fontSize: 13, color: Colors.gray[400], marginBottom: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '48%', alignItems: 'center', padding: Spacing.lg },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: 24, fontWeight: '800' },
  statUnit: { fontSize: 14, fontWeight: '600' },
  statLabel: { fontSize: 11, color: Colors.gray[400], marginTop: 4 },
  chartCard: { marginTop: Spacing.lg },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  chartPlaceholder: { height: 200, backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
});
