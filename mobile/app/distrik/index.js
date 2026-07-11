import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

export default function DistrikDashboardScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  
  // Real-time state
  const [dashboardData, setDashboardData] = useState({
    capacityUsed: 0,
    capacityMax: 5000,
    pendingCount: 0,
    recentPending: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/distrik/dashboard');
      setDashboardData({
        capacityUsed: res.data.capacityUsed || 0,
        capacityMax: res.data.capacityMax || 5000,
        pendingCount: res.data.pendingCount || 0,
        recentPending: res.data.recentPending || []
      });
    } catch (error) {
      console.log('Error fetching distrik dashboard:', error);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const distrikMenu = [
    {
      title: 'Tinjau Setoran',
      icon: 'scan',
      route: '/admin/distrik',
      color: Colors.green[500],
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50],
      badge: dashboardData.pendingCount > 0 ? dashboardData.pendingCount.toString() : null
    },
    {
      title: 'Kelola Toko',
      icon: 'storefront',
      route: '/distrik/toko',
      color: Colors.gold[400],
      bg: isDark ? 'rgba(45, 212, 191, 0.15)' : '#CCFBF1',
    },
    {
      title: 'Riwayat Setoran',
      icon: 'time',
      route: '/distrik/history',
      color: Colors.info,
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    },
    {
      title: 'Profil Bank Sampah',
      icon: 'location',
      route: '/distrik/profile',
      color: Colors.gold[500],
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : Colors.gold[50],
    },
  ];

  const capacityPercent = (dashboardData.capacityUsed / dashboardData.capacityMax) * 100;
  const clampedPercent = Math.min(capacityPercent, 100);

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        
        {/* Header Background */}
        <View style={dynamicStyles.headerBackground}>
          <LinearGradient 
            colors={[isDark ? 'rgba(59, 130, 246, 0.15)' : Colors.info + '20', colors.bg]} 
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <View style={dynamicStyles.container}>

        {/* Hero Card: Status & Capacity */}
        <View style={[dynamicStyles.heroCard, Shadows.lg]}>
          <LinearGradient 
            colors={isDark ? ['#1E3A8A', '#172554'] : [Colors.info, '#2563EB']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }}
            style={dynamicStyles.heroGradient}
          >
            <Ionicons name="cube-outline" size={150} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', right: -30, top: -20 }} />
            
            <View style={dynamicStyles.heroHeader}>
              <View>
                <Text style={dynamicStyles.heroTitle}>{user?.display_name || 'Bank Sampah'}</Text>
                <Text style={dynamicStyles.heroSubtitle}>ID: DISTRIK-{user?.id ? user.id.substring(0,6).toUpperCase() : '001'}</Text>
              </View>
              <View style={dynamicStyles.statusToggleWrap}>
                <Text style={dynamicStyles.statusText}>{isOpen ? 'BUKA' : 'TUTUP'}</Text>
                <Switch 
                  value={isOpen} 
                  onValueChange={setIsOpen}
                  trackColor={{ false: 'rgba(255,255,255,0.3)', true: Colors.green[400] }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            <View style={dynamicStyles.capacityWrap}>
              <View style={dynamicStyles.capacityLabelRow}>
                <Text style={dynamicStyles.capacityLabel}>{t('distrik.capacity', {defaultValue: 'Kapasitas Gudang'})}</Text>
                <Text style={dynamicStyles.capacityValue}>{dashboardData.capacityUsed} / {dashboardData.capacityMax} Kg</Text>
              </View>
              <View style={dynamicStyles.progressBarBg}>
                <View style={[dynamicStyles.progressBarFill, { width: `${clampedPercent}%`, backgroundColor: clampedPercent > 80 ? Colors.danger : Colors.green[400] }]} />
              </View>
              {clampedPercent > 80 && (
                <Text style={dynamicStyles.warningText}>{t('distrik.warning_full', {defaultValue: 'Gudang hampir penuh! Segera jual ke pusat.'})}</Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions / Widgets */}
        <Text style={dynamicStyles.sectionTitle}>{t('distrik.control_center', {defaultValue: 'Pusat Kendali'})}</Text>
        <View style={dynamicStyles.menuGrid}>
          {distrikMenu.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={dynamicStyles.menuItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.menuIconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
                {item.badge && (
                  <View style={dynamicStyles.badgeIndicator}>
                    <Text style={dynamicStyles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={dynamicStyles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Pending Deposits */}
        <View style={dynamicStyles.listHeader}>
          <Text style={dynamicStyles.sectionTitle}>{t('distrik.pending_deposit', {defaultValue: 'Setoran Menunggu Verifikasi'})}</Text>
          <TouchableOpacity onPress={() => router.push('/admin/verify-distrik')}>
            <Text style={dynamicStyles.seeAllBtn}>{t('distrik.see_all', {defaultValue: 'Lihat Semua'})}</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.depositList}>
          {dashboardData.recentPending.length === 0 ? (
            <View style={dynamicStyles.emptyPending}>
              <Ionicons name="checkmark-done-circle" size={40} color={Colors.green[500]} />
              <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13 }}>{t('distrik.no_queue', {defaultValue: 'Tidak ada antrean saat ini.'})}</Text>
            </View>
          ) : (
            dashboardData.recentPending.map((item) => (
              <View key={item.id} style={dynamicStyles.depositItem}>
                <View style={[dynamicStyles.depositIcon, { backgroundColor: Colors.info + '20' }]}>
                  <Ionicons name={item.waste_type === 'plastik' ? 'water' : 'document-text'} size={24} color={Colors.info} />
                </View>
                <View style={dynamicStyles.depositInfo}>
                  <Text style={dynamicStyles.depositUser}>{item.user_name}</Text>
                  <Text style={dynamicStyles.depositDetail}>{item.waste_type} • {parseFloat(item.weight_kg)} Kg</Text>
                </View>
                <TouchableOpacity style={dynamicStyles.verifyBtn} onPress={() => router.push('/admin/distrik')}>
                  <Text style={dynamicStyles.verifyBtnText}>{t('distrik.review', {defaultValue: 'Tinjau'})}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  container: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },

  // Hero Card
  heroCard: { borderRadius: BorderRadius['2xl'], marginBottom: Spacing['2xl'], shadowColor: Colors.info, shadowOpacity: isDark ? 0.4 : 0.2, shadowRadius: 15 },
  heroGradient: { borderRadius: BorderRadius['2xl'], padding: Spacing.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  heroTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  statusToggleWrap: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.xl },
  statusText: { color: Colors.white, fontSize: 10, fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  
  capacityWrap: { marginTop: Spacing.sm },
  capacityLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capacityLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  capacityValue: { color: Colors.white, fontSize: 13, fontWeight: '900' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  warningText: { color: '#FCA5A5', fontSize: 11, fontWeight: '700', marginTop: 8, fontStyle: 'italic' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  
  // Menu Grid
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, justifyContent: 'flex-start', marginBottom: Spacing['xl'] },
  menuItem: { width: '33.33%', alignItems: 'center', marginBottom: Spacing.xl },
  menuIconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  menuTitle: { fontSize: 11.5, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4, paddingHorizontal: 4 },
  badgeIndicator: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.danger, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },

  // List
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  seeAllBtn: { color: Colors.info, fontSize: 13, fontWeight: '700' },
  depositList: { gap: Spacing.md },
  depositItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: colors.border },
  depositIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  depositInfo: { flex: 1 },
  depositUser: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2, textTransform: 'capitalize' },
  depositDetail: { fontSize: 12, color: colors.textMuted, fontWeight: '500', textTransform: 'capitalize' },
  verifyBtn: { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : Colors.info + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full },
  verifyBtnText: { color: Colors.info, fontSize: 12, fontWeight: '800' },
  emptyPending: { padding: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : Colors.gray[50], borderRadius: BorderRadius.xl }
});
