import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function GreenPointScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/green-points/history');
      setHistory(res.data);
    } catch (error) {
      console.log('Error fetching GP history:', error);
    } finally {
      setLoading(false);
    }
  };

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
      dateStr = 'Hari ini';
    } else if (d.toDateString() === yesterday.toDateString()) {
      dateStr = 'Kemarin';
    } else {
      dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    return `${dateStr} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Header Section */}
      <View style={dynamicStyles.headerContainer}>
        <Text style={dynamicStyles.pageTitle}>Green Point</Text>
        <Text style={dynamicStyles.pageDesc}>Kumpulkan poin kebaikan untuk selamatkan bumi.</Text>
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
            onPress={() => router.push('/reward')}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.redeemBtnText}>{t('green_point.redeem')}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.green[700]} />
          </TouchableOpacity>
        </View>

        {/* Recent Activities (Bank Statement Style) */}
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Riwayat Poin</Text>
          <TouchableOpacity>
            <Text style={dynamicStyles.seeAllBtn}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        
        <View style={dynamicStyles.historyContainer}>
          {loading ? (
            <View style={{ padding: Spacing.xl, alignItems: 'center', marginTop: 40 }}>
              <ActivityIndicator size="large" color={Colors.green[500]} />
            </View>
          ) : history.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <View style={dynamicStyles.emptyIconBox}>
                <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              </View>
              <Text style={dynamicStyles.emptyTitle}>Belum Ada Aktivitas</Text>
              <Text style={dynamicStyles.emptyDesc}>Mulai setor sampah atau berdonasi untuk mengumpulkan poin.</Text>
            </View>
          ) : (
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
          )}
        </View>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerContainer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'], paddingBottom: Spacing.sm },
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
