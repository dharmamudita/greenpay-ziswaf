import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api, { getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function GreenPointScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'vouchers'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [user])
  );

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [histRes, vouchRes] = await Promise.all([
        api.get('/green-points/history'),
        api.get('/green-points/vouchers')
      ]);
      setHistory(histRes.data);
      setVouchers(vouchRes.data);
    } catch (error) {
      console.log('Error fetching GP data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
  }, [user]);

  const getIconForSource = (source) => {
    switch(source) {
      case 'waste_deposit': return 'refresh';
      case 'donation': return 'heart';
      case 'purchase': return 'cart';
      case 'reward': return 'gift';
      default: return 'leaf';
    }
  };
  
  const getIconColorForSource = (source) => {
    switch(source) {
      case 'waste_deposit': return Colors.info;
      case 'donation': return Colors.pink;
      case 'purchase': return Colors.purple;
      case 'reward': return Colors.gold[500];
      default: return Colors.green[500];
    }
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateStr = '';
    if (d.toDateString() === today.toDateString()) {
      dateStr = t('green_point.today');
    } else if (d.toDateString() === yesterday.toDateString()) {
      dateStr = t('green_point.yesterday');
    } else {
      dateStr = d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    return `${dateStr} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <ScrollView 
      style={dynamicStyles.screen} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      
      {/* Header Section */}
      <View style={dynamicStyles.headerContainer}>
        <Text style={dynamicStyles.pageTitle}>{t('green_point.title')}</Text>
        <Text style={dynamicStyles.pageDesc}>{t('green_point.desc')}</Text>
      </View>

      <View style={dynamicStyles.container}>
        {/* Fintech-Style Balance Card */}
        <View style={dynamicStyles.balanceCard}>
          <View style={dynamicStyles.balanceHeader}>
            <View style={dynamicStyles.balanceHeaderLeft}>
              <View style={dynamicStyles.leafIconBox}>
                <Ionicons name="leaf" size={20} color={Colors.white} />
              </View>
              <Text style={dynamicStyles.balanceLabel}>{t('green_point.balance')}</Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
          </View>
          
          <View style={dynamicStyles.balanceCenter}>
            <Text style={dynamicStyles.balanceCurrency}>GP</Text>
            <Text style={dynamicStyles.balanceValue}>{user?.green_points?.toLocaleString('id-ID') || 0}</Text>
          </View>
          
          <Text style={dynamicStyles.balanceSub}>{t('green_point.subtitle')}</Text>
          
          <TouchableOpacity 
            style={dynamicStyles.redeemBtn} 
            onPress={() => router.push('/marketplace')}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.redeemBtnText}>{t('green_point.redeem')}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.green[700]} />
          </TouchableOpacity>
        </View>

        {/* Custom Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: isDark ? colors.surface2 : Colors.gray[100], borderRadius: 12, padding: 4, marginBottom: Spacing.xl, marginTop: Spacing.xl }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'history' ? colors.surface : 'transparent', ...(activeTab === 'history' ? Shadows.sm : {}) }}
            onPress={() => setActiveTab('history')}
          >
            <Text style={{ fontWeight: activeTab === 'history' ? '700' : '500', color: activeTab === 'history' ? colors.text : colors.textMuted }}>Riwayat Poin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === 'vouchers' ? colors.surface : 'transparent', ...(activeTab === 'vouchers' ? Shadows.sm : {}) }}
            onPress={() => setActiveTab('vouchers')}
          >
            <Text style={{ fontWeight: activeTab === 'vouchers' ? '700' : '500', color: activeTab === 'vouchers' ? colors.text : colors.textMuted }}>Voucher Saya</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.green[500]} style={{ marginTop: 40 }} />
        ) : activeTab === 'history' ? (
          <View style={dynamicStyles.historyContainer}>
            {history.length > 0 ? (
              history.map((act, index) => {
                const isEarn = act.type === 'earn';
                const isLast = index === history.length - 1;
                const iconColor = getIconColorForSource(act.source);
                
                return (
                  <View key={act.id} style={[dynamicStyles.activityRow, !isLast && dynamicStyles.activityBorder]}>
                    <View style={[dynamicStyles.activityIconBox, { backgroundColor: iconColor + (isDark ? '25' : '15') }]}>
                      <Ionicons name={getIconForSource(act.source)} size={20} color={iconColor} />
                    </View>
                    
                    <View style={dynamicStyles.activityContent}>
                      <Text style={dynamicStyles.actAction} numberOfLines={1}>{act.description}</Text>
                      <Text style={dynamicStyles.actTime}>{formatTime(act.created_at)}</Text>
                    </View>
                    
                    <View style={dynamicStyles.activityAmountBox}>
                      <Text style={[
                        dynamicStyles.actAmount, 
                        isEarn ? dynamicStyles.actAmountEarn : dynamicStyles.actAmountSpend
                      ]}>
                        {isEarn ? '+' : '-'}{act.points}
                      </Text>
                      <Text style={dynamicStyles.actUnit}>GP</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={dynamicStyles.emptyState}>
                <View style={dynamicStyles.emptyIconBox}>
                  <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
                </View>
                <Text style={dynamicStyles.emptyTitle}>{t('green_point.empty_title')}</Text>
                <Text style={dynamicStyles.emptyDesc}>{t('green_point.empty_desc')}</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {vouchers.length > 0 ? (
              vouchers.map((v) => (
                <View key={v.id} style={{ backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...Shadows.sm }}>
                  <View style={{ flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, borderStyle: 'dashed' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: isDark ? colors.surface2 : Colors.gray[100], marginRight: 16, overflow: 'hidden' }}>
                      {v.image_url ? (
                        <Image source={{ uri: getImageUrl(v.image_url) }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                      ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="gift" size={24} color={Colors.gold[400]} />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{v.reward_name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{v.umkm_name}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: v.status === 'completed' ? (isDark ? colors.surface2 : Colors.gray[50]) : (isDark ? '#2B2412' : '#FFFBEB') }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kode Voucher</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: v.status === 'completed' ? colors.textMuted : Colors.gold[600], letterSpacing: 2 }}>{v.voucher_code}</Text>
                    </View>
                    <View style={{ backgroundColor: v.status === 'completed' ? Colors.gray[300] : Colors.gold[500], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                      <Text style={{ color: v.status === 'completed' ? Colors.gray[600] : Colors.white, fontSize: 12, fontWeight: '700' }}>
                        {v.status === 'completed' ? 'SUDAH DIKLAIM' : 'AKTIF'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={dynamicStyles.emptyState}>
                <Ionicons name="ticket-outline" size={64} color={Colors.gray[300]} />
                <Text style={dynamicStyles.emptyText}>Anda belum menukarkan voucher apapun.</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerContainer: { paddingHorizontal: Spacing.xl, paddingTop: 70, paddingBottom: Spacing.sm },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 15, color: colors.textMuted, marginTop: 4, lineHeight: 22 },
  
  container: { padding: Spacing.xl, paddingTop: Spacing.md },
  
  // Premium Balance Card
  balanceCard: { 
    backgroundColor: Colors.green[500],
    borderRadius: BorderRadius['2xl'], 
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
    ...Shadows.lg,
    shadowColor: Colors.green[500],
    shadowOpacity: isDark ? 0 : 0.3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  balanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leafIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  
  balanceCenter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    marginRight: 6,
  },
  balanceValue: { 
    fontSize: 48, 
    fontWeight: '800', 
    color: Colors.white,
    letterSpacing: -1,
  },
  balanceSub: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 13, 
    marginBottom: Spacing.xl 
  },
  
  redeemBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redeemBtnText: {
    color: Colors.green[700],
    fontSize: 15,
    fontWeight: '700',
  },

  // History Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  seeAllBtn: { fontSize: 14, fontWeight: '600', color: Colors.green[500] },
  
  historyContainer: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    ...Shadows.sm,
    shadowOpacity: 0.05,
  },
  
  // Bank Statement Row Style
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actAction: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  actTime: { 
    fontSize: 12, 
    color: colors.textMuted,
    fontWeight: '500',
  },
  activityAmountBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  actAmountEarn: {
    color: Colors.green[500],
  },
  actAmountSpend: {
    color: isDark ? colors.text : Colors.gray[800],
  },
  actUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  }
});
