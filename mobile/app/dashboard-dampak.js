import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function DashboardDampakScreen() {
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/impact/dashboard');
      setStats(res.data.stats);
      setMonthlyTrend(res.data.monthlyTrend ? res.data.monthlyTrend.reverse() : []); // Reverse to show oldest to newest left to right
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const fmtWaste = (kg) => {
    if (!kg) return { v: '0', u: 'kg' };
    if (kg >= 1000) return { v: (kg / 1000).toFixed(1), u: 'Ton' };
    return { v: kg, u: 'kg' };
  };

  const fmtMoney = (rp) => {
    if (!rp) return { v: '0', u: '' };
    if (i18n.language === 'en') {
      const usd = rp / 15000;
      if (usd >= 1000) return { v: (usd / 1000).toFixed(1), u: 'K' };
      return { v: usd.toFixed(1), u: '' };
    }
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
    { icon: 'people', value: stats?.total_users || 0, label: t('impact.active_users'), color: Colors.info, gradient: [Colors.info, '#3B82F6'] },
    { icon: 'refresh', value: waste.v, unit: waste.u, label: t('impact.total_waste'), color: Colors.green[500], gradient: [Colors.green[400], Colors.green[600]] },
    { icon: 'heart', value: `${i18n.language === 'en' ? '$' : 'Rp'}${money.v}`, unit: money.u, label: t('impact.total_funds'), color: Colors.gold[400], gradient: [Colors.gold[400], Colors.gold[600]] },
    { icon: 'cube', value: stats?.total_programs || 0, label: t('impact.ziswaf_programs'), color: Colors.green[400], gradient: [Colors.green[300], Colors.green[500]] },
    { icon: 'cloud', value: co2.v, unit: co2.u, label: t('impact.co2_reduced'), color: isDark ? Colors.gray[300] : Colors.gray[500], gradient: [Colors.gray[400], Colors.gray[600]] },
    { icon: 'storefront', value: stats?.total_umkm || 0, label: t('impact.eco_products'), color: Colors.purple, gradient: ['#A855F7', '#7E22CE'] },
  ];

  // Calculate chart max value
  const maxWaste = Math.max(...monthlyTrend.map(m => parseFloat(m.waste_kg) || 0), 10); // min max of 10

  return (
    <ScrollView 
      style={dynamicStyles.screen} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      
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

        <Text style={dynamicStyles.heroSub}>{t('impact.global_report')}</Text>
        <Text style={dynamicStyles.heroTitle}>{co2.v} <Text style={{ fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>{co2.u}</Text></Text>
        <Text style={dynamicStyles.heroDesc}>{t('impact.co2_prevented')}</Text>

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
              <Text style={dynamicStyles.chartTitle}>{t('impact.chart_title')}</Text>
              <Text style={dynamicStyles.chartSubtitle}>{t('impact.chart_subtitle')}</Text>
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
            {/* Real Chart Bars */}
            {monthlyTrend.length > 0 ? (
              <View style={dynamicStyles.chartLineWrapper}>
                {monthlyTrend.map((m, i) => {
                  const kg = parseFloat(m.waste_kg) || 0;
                  const h = Math.max((kg / maxWaste) * 100, 5); // min 5% height
                  const monthName = new Date(m.month).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { month: 'short' });
                  return (
                    <View key={i} style={dynamicStyles.chartColumn}>
                      <View style={[dynamicStyles.chartBar, { height: `${h}%`, backgroundColor: Colors.green[500] }]} />
                      <Text style={dynamicStyles.chartLabel}>{monthName}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={dynamicStyles.chartOverlayText}>
                <Ionicons name="information-circle" size={16} color={Colors.gold[500]} style={{ marginBottom: 4 }} />
                <Text style={dynamicStyles.chartOverlayLabel}>{t('impact.chart_empty')}</Text>
              </View>
            )}
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
  chartLineWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 25,
    height: '100%',
    width: '100%',
  },
  chartColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
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
