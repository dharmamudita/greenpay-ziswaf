import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import api from '../services/api';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

export default function TransparansiZiswafScreen() {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('donasi'); // 'donasi' | 'penyaluran'

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes, distRes] = await Promise.all([
        api.get('/ziswaf/stats'),
        api.get('/ziswaf/public-history'),
        api.get('/ziswaf/public-distributions')
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data);
      setDistributions(distRes.data);
    } catch (error) {
      console.log('Error fetching transparency data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold[500]} />
      </View>
    );
  }

  const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  return (
    <View style={dynamicStyles.container}>
      <ScrollView 
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold[500]} />}
      >
        
        {/* Banner Transparansi */}
        <View style={dynamicStyles.heroCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.white} style={{ marginBottom: Spacing.sm }} />
          <Text style={dynamicStyles.heroTitle}>Laporan Transparansi</Text>
          <Text style={dynamicStyles.heroDesc}>Semua dana ZISWAF yang masuk dan tersalurkan dapat dipantau oleh publik.</Text>
          
          <View style={dynamicStyles.heroStats}>
            <Text style={dynamicStyles.heroStatsLabel}>Total Dana Terkumpul</Text>
            <Text style={dynamicStyles.heroStatsValue}>{formatRp(stats?.total_fund)}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity 
            style={[dynamicStyles.tabBtn, activeTab === 'donasi' && dynamicStyles.tabBtnActive]}
            onPress={() => setActiveTab('donasi')}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'donasi' && dynamicStyles.tabTextActive]}>Donasi Masuk</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.tabBtn, activeTab === 'penyaluran' && dynamicStyles.tabBtnActive]}
            onPress={() => setActiveTab('penyaluran')}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'penyaluran' && dynamicStyles.tabTextActive]}>Bukti Penyaluran</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'donasi' ? (
          <>
            <Text style={dynamicStyles.sectionTitle}>15 Donasi Terakhir (Real-time)</Text>
            {history.length === 0 ? (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="time-outline" size={48} color={colors.textMuted} />
                <Text style={dynamicStyles.emptyText}>Belum ada riwayat donasi yang sukses.</Text>
              </View>
            ) : (
              history.map((item, idx) => (
                <View key={item.id || idx} style={dynamicStyles.historyCard}>
                  <View style={dynamicStyles.historyLeft}>
                    <View style={dynamicStyles.avatarBox}>
                      <Text style={dynamicStyles.avatarText}>{item.masked_name[0]}</Text>
                    </View>
                    <View>
                      <Text style={dynamicStyles.historyName}>{item.masked_name}</Text>
                      <Text style={dynamicStyles.historyProgram} numberOfLines={1}>{item.program_title}</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.historyRight}>
                    <Text style={dynamicStyles.historyAmount}>{formatRp(item.amount)}</Text>
                    <Text style={dynamicStyles.historyDate}>
                      {new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={dynamicStyles.sectionTitle}>Transparansi Penyaluran</Text>
            {distributions.length === 0 ? (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="documents-outline" size={48} color={colors.textMuted} />
                <Text style={dynamicStyles.emptyText}>Belum ada data penyaluran dana.</Text>
              </View>
            ) : (
              distributions.map((dist, idx) => (
                <View key={dist.id || idx} style={dynamicStyles.distCard}>
                  <View style={dynamicStyles.distHeader}>
                    <Text style={dynamicStyles.distDate}>
                      {new Date(dist.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <View style={dynamicStyles.distBadge}>
                      <Text style={dynamicStyles.distBadgeText}>Tersalurkan</Text>
                    </View>
                  </View>
                  <Text style={dynamicStyles.distAmount}>{formatRp(dist.amount)}</Text>
                  <Text style={dynamicStyles.distProgram}>{dist.program_title}</Text>
                  <View style={dynamicStyles.distDivider} />
                  <Text style={dynamicStyles.distDesc}>{dist.description}</Text>
                  <View style={dynamicStyles.distFooter}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.green[500]} style={{ marginRight: 4 }} />
                    <Text style={dynamicStyles.distAdmin}>Diverifikasi oleh: {dist.admin_name}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  
  heroCard: {
    backgroundColor: Colors.gold[500],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: Spacing.lg },
  heroStats: { backgroundColor: 'rgba(255,255,255,0.15)', padding: Spacing.lg, borderRadius: BorderRadius.xl },
  heroStatsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 4 },
  heroStatsValue: { fontSize: 28, fontWeight: '900', color: Colors.white, letterSpacing: -1 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg },
  
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.05
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.sm },
  avatarBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? colors.bg : Colors.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.gold[600] },
  historyName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  historyProgram: { fontSize: 12, color: colors.textMuted },
  
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 14, fontWeight: '800', color: Colors.green[600], marginBottom: 2 },
  historyDate: { fontSize: 11, color: colors.textMuted },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: colors.textMuted, marginTop: 12, fontSize: 14 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100], borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.xl },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: BorderRadius.lg },
  tabBtnActive: { backgroundColor: Colors.white, ...Shadows.sm },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: Colors.gold[600], fontWeight: '800' },
  
  distCard: { backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius['2xl'], marginBottom: Spacing.lg, borderWidth: 1, borderColor: colors.border, ...Shadows.sm },
  distHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  distDate: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  distBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  distBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.green[600] },
  distAmount: { fontSize: 24, fontWeight: '900', color: Colors.green[600], letterSpacing: -1, marginBottom: 2 },
  distProgram: { fontSize: 14, fontWeight: '700', color: colors.text },
  distDivider: { height: 1, backgroundColor: colors.border, marginVertical: Spacing.md, borderStyle: 'dashed' },
  distDesc: { fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: Spacing.md },
  distFooter: { flexDirection: 'row', alignItems: 'center' },
  distAdmin: { fontSize: 11, color: colors.textMuted, fontWeight: '600' }
});
