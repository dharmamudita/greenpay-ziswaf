import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, Dimensions, Linking, Alert, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const featuresKeys = [
  { icon: 'refresh-circle', titleKey: 'Sampah', color: Colors.green[500], route: '/bank-sampah' },
  { icon: 'eye', titleKey: 'Transparan', color: Colors.gold[500], route: '/transparansi-ziswaf' },
  { icon: 'bar-chart', titleKey: 'Dampak', color: Colors.purple, route: '/dashboard-dampak' },
  { icon: 'document-text', titleKey: 'Paspor', color: Colors.pink, route: '/impact-passport' },
];

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const dynamicStyles = getStyles(colors, isDark);

  const [stats, setStats] = useState({ total_waste: 0, total_users: 0, total_fund: 0, total_products: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, campRes, notifRes] = await Promise.all([
        api.get('/ziswaf/stats'),
        api.get('/ziswaf/programs'),
        isAuthenticated ? api.get('/users/notifications') : Promise.resolve({ data: [] })
      ]);
      setStats(statsRes.data);
      setCampaigns(campRes.data.slice(0, 5)); // Only show top 5 on home
      if (isAuthenticated && notifRes.data) {
        setHasUnread(notifRes.data.some(n => !n.is_read));
      }
    } catch (error) {
      console.log('Error fetching home data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const statsList = [
    { icon: 'refresh-circle', value: stats.total_waste, unit: 'Kg', labelKey: 'home.stat_waste', color: Colors.green[500] },
    { icon: 'people', value: stats.total_users, unit: '', labelKey: 'home.stat_trees', color: Colors.green[400] }, // Reuse label or change icon
    { icon: 'heart', value: (stats.total_fund / 1000000).toFixed(1), unit: 'Jt', labelKey: 'home.stat_fund', color: Colors.gold[400] },
    { icon: 'storefront', value: stats.total_products, unit: '', labelKey: 'home.stat_sme', color: Colors.info },
  ];

  return (
    <View style={dynamicStyles.container}>
      {/* Fixed Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerTop}>
          <View style={dynamicStyles.headerUser}>
            {isAuthenticated ? (
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                {user?.photo_url ? (
                  <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatarSmall} />
                ) : (
                  <View style={dynamicStyles.avatarSmallPlaceholder}>
                    <Text style={{ color: Colors.white, fontWeight: 'bold' }}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                )}
                <View>
                  <Text style={dynamicStyles.greetingText}>Hai, {user?.display_name?.split(' ')[0]} 👋</Text>
                  <Text style={dynamicStyles.statusText}>Pahlawan Bumi</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={dynamicStyles.greetingText}>{t('home.title1')}</Text>
                <Text style={dynamicStyles.statusText}>{t('home.subtitle')}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={dynamicStyles.notificationBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={isDark ? Colors.white : Colors.gray[800]} />
            {isAuthenticated && hasUnread && <View style={dynamicStyles.notificationDot} />}
          </TouchableOpacity>
        </View>

        {/* Hero Card / Balance */}
        <View style={[dynamicStyles.heroCard, Shadows.lg, { backgroundColor: isDark ? Colors.green[700] : Colors.green[600] }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                {isAuthenticated ? 'Total Green Point' : 'Mari Berkontribusi'}
              </Text>
              {isAuthenticated ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="leaf" size={24} color={Colors.gold[400]} />
                  <Text style={{ color: Colors.white, fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>
                    {user?.green_points?.toLocaleString('id-ID') || '0'}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800', lineHeight: 28, maxWidth: '85%' }}>
                  Mulai langkah kecilmu untuk bumi hari ini
                </Text>
              )}
            </View>
            {isAuthenticated && (
              <TouchableOpacity style={dynamicStyles.heroActionBtn} onPress={() => router.push('/marketplace')}>
                <Text style={{ color: Colors.green[700], fontSize: 12, fontWeight: '700' }}>Tukar</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isAuthenticated && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: Colors.white, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={{ color: Colors.green[700], fontSize: 15, fontWeight: '700' }}>{t('home.start_now')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '700' }}>{t('home.login')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={dynamicStyles.screen} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        
        {/* Features Menu (4x2 Grid) */}
        <View style={dynamicStyles.menuGrid}>
          {featuresKeys.map((f, i) => (
            <TouchableOpacity 
              key={i} 
              style={dynamicStyles.menuItem}
              onPress={() => router.push(f.route)}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.menuIconBox, { backgroundColor: f.color + (isDark ? '25' : '15') }]}>
                <Ionicons name={f.icon} size={26} color={f.color} />
              </View>
              <Text style={dynamicStyles.menuTitle}>{f.titleKey}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Impact Stats (Horizontal Scroll) */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Jejak Kebaikan Kita</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: 8 }}>
            {statsList.map((s, i) => (
              <View key={i} style={[dynamicStyles.statCard, Shadows.sm]}>
                <View style={[dynamicStyles.statIconBox, { backgroundColor: s.color + (isDark ? '25' : '15') }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <View>
                  <Text style={dynamicStyles.statValue}>{s.value}<Text style={dynamicStyles.statUnit}> {s.unit}</Text></Text>
                  <Text style={dynamicStyles.statLabel}>{t(s.labelKey)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Campaigns (Horizontal Slider) */}
        <View style={[dynamicStyles.section, { marginTop: Spacing.xl }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}>
            <Text style={dynamicStyles.sectionTitle}>Aksi Hijau Terbaru</Text>
            <TouchableOpacity>
              <Text style={{ color: Colors.green[500], fontWeight: '600', fontSize: 13 }}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.75 + Spacing.md} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: 20 }}>
            {campaigns.length === 0 ? (
              <View style={{ width: width - Spacing.xl * 2, padding: Spacing.xl, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100], borderRadius: 20 }}>
                <Ionicons name="leaf-outline" size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>Belum ada kampanye ZISWAF yang aktif saat ini.</Text>
              </View>
            ) : (
              campaigns.map((camp) => {
                const progress = Math.min((camp.collected_amount / camp.target_amount) * 100, 100);
                return (
                  <TouchableOpacity 
                    key={camp.id} 
                    style={[dynamicStyles.campaignCard, Shadows.sm]} 
                    activeOpacity={0.9}
                    onPress={() => {
                      router.push(`/ziswaf/${camp.id}`);
                    }}
                  >
                    <Image source={{ uri: camp.image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500&q=80' }} style={dynamicStyles.campaignImage} />
                    <View style={dynamicStyles.campaignContent}>
                      <Text style={dynamicStyles.campaignTitle} numberOfLines={2}>{camp.title}</Text>
                      <View style={dynamicStyles.progressBarBg}>
                        <View style={[dynamicStyles.progressBarFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={dynamicStyles.progressText}>{Math.round(progress)}% Terkumpul</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>

      {/* Floating Action Button untuk Eco-Ustadz AI */}
      <TouchableOpacity 
        style={[dynamicStyles.fab, Shadows.md, { backgroundColor: Colors.green[600] }]} 
        activeOpacity={0.9}
        onPress={() => router.push('/eco-ustadz')}
      >
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
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    zIndex: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerUser: { flex: 1 },
  avatarSmall: { width: 44, height: 44, borderRadius: 22 },
  avatarSmallPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.green[500], alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontSize: 18, fontWeight: '800', color: colors.text },
  statusText: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? colors.bg : Colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  
  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  heroActionBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  menuIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20, // Squircle shape
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },

  // Section
  section: { marginTop: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: Spacing.md, paddingHorizontal: Spacing.xl },

  // Stats Horizontal
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    paddingRight: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  statUnit: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  // Campaigns
  campaignCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: width * 0.75,
    overflow: 'hidden',
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  campaignImage: { width: '100%', height: 140, backgroundColor: isDark ? colors.bg : Colors.gray[200] },
  campaignContent: { padding: Spacing.lg },
  campaignTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: Spacing.md, lineHeight: 22 },
  progressBarBg: { width: '100%', height: 6, backgroundColor: isDark ? colors.bg : Colors.gray[100], borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: Colors.green[500], borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: Colors.green[500] },

  // FAB
  fab: { position: 'absolute', bottom: Spacing['2xl'], right: Spacing.xl, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.green[600], alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fabSparkle: { position: 'absolute', top: 12, right: 12 },
});
