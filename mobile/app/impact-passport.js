import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ImpactPassportScreen() {
  const { user } = useAuth();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  const fetchPassport = async () => {
    try {
      const res = await api.get('/impact/passport');
      setPassportData(res.data);
    } catch (error) {
      console.log('Error fetching passport:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPassport();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPassport();
  };

  const fmt = (n, isCurrency = false) => {
    if (!n) return 0;
    if (isCurrency && i18n.language === 'en') {
      const usd = n / 15000;
      if (usd >= 1000) return (usd / 1000).toFixed(1) + ' K';
      return usd.toFixed(1);
    }
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' Jt';
    if (n >= 1000) return (n / 1000).toFixed(1) + ' Rb';
    return n;
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  const pUser = passportData?.user || user;
  const badges = passportData?.badges || [];
  
  // Fake Barcode Pattern
  const renderBarcode = () => {
    const bars = [2, 4, 1, 3, 2, 6, 1, 2, 4, 1, 1, 3, 2, 1, 4];
    return (
      <View style={dynamicStyles.barcodeContainer}>
        {bars.map((w, i) => (
          <View key={i} style={[dynamicStyles.barcodeLine, { width: w }]} />
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={dynamicStyles.screen} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      
      {/* Background Ambience */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(16, 185, 129, 0.2)' : Colors.green[100], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        <View style={dynamicStyles.pageHeader}>
          <Text style={dynamicStyles.pageTitle}>{t('passport.title')}</Text>
          <Text style={dynamicStyles.pageDesc}>{t('passport.subtitle')}</Text>
        </View>

        {/* VIP Smart Passport Card */}
        <View style={[dynamicStyles.passportWrapper, Shadows.lg]}>
          <LinearGradient 
            colors={isDark ? ['#064E3B', '#022C22'] : [Colors.green[700], Colors.green[900]]} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }}
            style={dynamicStyles.passportCard}
          >
            {/* Watermark Logo */}
            <Ionicons name="earth" size={240} color="rgba(255,255,255,0.03)" style={dynamicStyles.watermark} />
            <Ionicons name="leaf" size={120} color="rgba(255,255,255,0.04)" style={dynamicStyles.watermarkSecondary} />

            <View style={dynamicStyles.passHeader}>
              <View>
                <Text style={dynamicStyles.passTitle}>{t('screens.passport_title').toUpperCase()}</Text>
                <View style={dynamicStyles.vipBadge}>
                  <Ionicons name="star" size={10} color={Colors.gold[400]} />
                  <Text style={dynamicStyles.vipBadgeText}>GLOBAL CITIZEN</Text>
                </View>
              </View>
              
              <View style={dynamicStyles.chipIcon}>
                <Ionicons name="hardware-chip-outline" size={32} color={Colors.gold[400]} />
              </View>
            </View>
            
            <View style={dynamicStyles.passBody}>
              <View style={dynamicStyles.avatarWrapper}>
                <LinearGradient colors={[Colors.gold[300], Colors.gold[600]]} style={dynamicStyles.avatar}>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: Colors.white }}>{pUser?.display_name?.[0]?.toUpperCase() || 'A'}</Text>
                </LinearGradient>
              </View>
              <View style={dynamicStyles.userInfo}>
                <Text style={dynamicStyles.nameLabel}>{t('passport.full_name')}</Text>
                <Text style={dynamicStyles.name} numberOfLines={1}>{pUser?.display_name || 'Pengguna'}</Text>
                
                <Text style={dynamicStyles.nameLabel}>{t('passport.passport_id')}</Text>
                <Text style={dynamicStyles.id}>GPZ-{new Date().getFullYear()}-{user?.id?.substring(0,6).toUpperCase() || '8X9A2C'}</Text>
                
                <View style={dynamicStyles.statusWrap}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.gold[400]} />
                  <Text style={dynamicStyles.statusText}>VERIFIED ECO CITIZEN</Text>
                </View>
              </View>
            </View>

            {/* Glassmorphism Stats */}
            <View style={dynamicStyles.passStatsWrapper}>
              <View style={dynamicStyles.glassmorphismContainer}>
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_waste || 0)} <Text style={dynamicStyles.passStatUnit}>kg</Text></Text>
                  <Text style={dynamicStyles.passStatLbl}>{t('passport.waste')}</Text>
                </View>
                <View style={dynamicStyles.passStatDivider} />
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_donation || 0, true)} <Text style={dynamicStyles.passStatUnit}>{i18n.language === 'en' ? 'USD' : 'Rp'}</Text></Text>
                  <Text style={dynamicStyles.passStatLbl}>{t('passport.ziswaf')}</Text>
                </View>
                <View style={dynamicStyles.passStatDivider} />
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{pUser?.trees_planted || 0} <Text style={dynamicStyles.passStatUnit}>{t('passport.tree_unit')}</Text></Text>
                  <Text style={dynamicStyles.passStatLbl}>{t('passport.planted')}</Text>
                </View>
              </View>
            </View>
            
            {/* Footer with Barcode */}
            <View style={dynamicStyles.passFooter}>
              {renderBarcode()}
              <Ionicons name="finger-print" size={24} color="rgba(255,255,255,0.4)" />
            </View>
          </LinearGradient>
        </View>

        {/* Glowing Trophy Room (Badges) */}
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>{t('passport.achievements_title')}</Text>
          <Text style={dynamicStyles.sectionSub}>{t('passport.achievements_subtitle')}</Text>
        </View>

        {badges.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconWrap}>
              <Ionicons name="medal-outline" size={56} color={Colors.gold[400]} />
            </View>
            <Text style={dynamicStyles.emptyStateTitle}>{t('passport.empty_title')}</Text>
            <Text style={dynamicStyles.emptyStateDesc}>{t('passport.empty_subtitle')}</Text>
          </View>
        ) : (
          <View style={dynamicStyles.badgeGrid}>
            {badges.map((b, i) => (
              <View key={i} style={dynamicStyles.badgeCardWrap}>
                <View style={dynamicStyles.badgeCardGlow} />
                <View style={dynamicStyles.badgeCard}>
                  <LinearGradient 
                    colors={[isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.1)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={dynamicStyles.badgeIconRing}>
                    <Ionicons name={b.icon || 'star'} size={32} color={Colors.gold[500]} />
                  </View>
                  <Text style={dynamicStyles.badgeName} numberOfLines={2}>{b.name}</Text>
                  <Text style={dynamicStyles.badgeDesc} numberOfLines={2}>{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 300,
  },
  
  container: { padding: Spacing.xl, paddingTop: Spacing['2xl'] },
  
  pageHeader: { marginBottom: Spacing['2xl'] },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 14, color: colors.textMuted, marginTop: 4 },

  // VIP Passport Card
  passportWrapper: {
    marginBottom: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    shadowColor: Colors.green[800],
    shadowOpacity: isDark ? 0.4 : 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  passportCard: { 
    borderRadius: BorderRadius['2xl'],
    padding: 0, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)'
  },
  watermark: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    transform: [{ rotate: '-15deg' }]
  },
  watermarkSecondary: {
    position: 'absolute',
    top: 20,
    left: -20,
    transform: [{ rotate: '30deg' }]
  },
  
  passHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: Spacing.lg, 
    paddingBottom: Spacing.md,
    alignItems: 'flex-start'
  },
  passTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: Colors.white, 
    letterSpacing: 2,
    marginBottom: 4
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  vipBadgeText: { 
    color: Colors.gold[400], 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 4,
  },
  chipIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  
  passBody: { 
    flexDirection: 'row', 
    paddingHorizontal: Spacing.lg, 
    paddingBottom: Spacing.lg, 
    gap: Spacing.lg, 
    alignItems: 'center' 
  },
  avatarWrapper: { 
    padding: 4, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: Colors.gold[500],
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  userInfo: { flex: 1, justifyContent: 'center' },
  nameLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: Colors.white, 
    marginBottom: 10, 
    letterSpacing: -0.5 
  },
  id: { 
    fontSize: 14, 
    color: Colors.gold[300], 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 10,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  passStatsWrapper: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  glassmorphismContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.xl, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  passStatItem: { flex: 1, alignItems: 'center' },
  passStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  passStatVal: { fontSize: 18, fontWeight: '900', color: Colors.white, marginBottom: 2 },
  passStatUnit: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  passStatLbl: { fontSize: 10, color: Colors.green[100], fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  passFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  barcodeContainer: {
    flexDirection: 'row',
    height: 24,
    alignItems: 'flex-end',
    gap: 2,
    opacity: 0.4,
  },
  barcodeLine: {
    backgroundColor: Colors.white,
    height: '100%',
  },

  // Glowing Trophy Room (Badges)
  sectionHeader: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCardWrap: {
    width: '48%',
    marginBottom: 16,
    position: 'relative',
  },
  badgeCardGlow: {
    position: 'absolute',
    top: 10, left: 10, right: 10, bottom: 10,
    backgroundColor: Colors.gold[400],
    borderRadius: BorderRadius.xl,
    opacity: isDark ? 0.3 : 0.4,
    filter: 'blur(15px)', // Works in Web, gives nice falloff
  },
  badgeCard: { 
    backgroundColor: colors.surface,
    padding: Spacing.lg, 
    alignItems: 'center', 
    borderRadius: BorderRadius.xl, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.5)',
    ...Shadows.md,
    shadowColor: Colors.gold[500],
  },
  badgeIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : Colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  badgeName: { fontSize: 14, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 4, letterSpacing: -0.2 },
  badgeDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : Colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  }
});
