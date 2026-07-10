import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RewardScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/green-points/rewards');
      setRewards(res.data);
    } catch (error) {
      console.log('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId, rewardName, cost) => {
    Alert.alert(
      "Konfirmasi Penukaran",
      `Tukar ${cost} GP dengan ${rewardName}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Tukar", 
          onPress: async () => {
            try {
              setRedeeming(rewardId);
              await api.post('/green-points/redeem', { reward_id: rewardId });
              Alert.alert('Berhasil', 'Reward berhasil ditukar! Silakan cek notifikasi Anda.');
              fetchRewards(); // Refresh stock
            } catch (error) {
              console.log('Error redeeming:', error);
              Alert.alert('Gagal', error.response?.data?.error || 'Gagal menukar poin.');
            } finally {
              setRedeeming(null);
            }
          }
        }
      ]
    );
  };

  const getIconForCategory = (category) => {
    switch((category || '').toLowerCase()) {
      case 'voucher': return 'ticket';
      case 'produk': return 'cube';
      case 'lingkungan': return 'leaf';
      case 'merchandise': return 'shirt';
      default: return 'gift';
    }
  };

  const userPoints = user?.green_points || 0;

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Ambient Background Glow */}
      <View style={dynamicStyles.ambientGlow}>
        <LinearGradient 
          colors={[isDark ? 'rgba(250, 204, 21, 0.15)' : Colors.gold[50], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        <Text style={dynamicStyles.pageTitle}>{t('screens.reward_title')}</Text>
        
        {/* VIP Digital Wallet Card */}
        <View style={[dynamicStyles.walletWrapper, Shadows.lg]}>
          <LinearGradient 
            colors={isDark ? ['#3F2E05', '#785A00'] : [Colors.gold[600], Colors.gold[500]]} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }}
            style={dynamicStyles.walletCard}
          >
            {/* Abstract Background Pattern */}
            <Ionicons name="aperture" size={200} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', right: -50, top: -50 }} />
            
            <View style={dynamicStyles.walletHeader}>
              <Text style={dynamicStyles.walletTitle}>GREEN PAY REWARDS</Text>
              <Ionicons name="hardware-chip-outline" size={32} color="rgba(255,255,255,0.8)" />
            </View>

            <View style={dynamicStyles.walletBody}>
              <Text style={dynamicStyles.walletLabel}>TOTAL SALDO POIN</Text>
              <View style={dynamicStyles.balanceRow}>
                <Text style={dynamicStyles.walletBalance}>{userPoints.toLocaleString()}</Text>
                <Text style={dynamicStyles.walletCurrency}>GP</Text>
              </View>
            </View>

            <View style={dynamicStyles.walletFooter}>
              <Text style={dynamicStyles.walletMemberName}>{user?.display_name?.toUpperCase() || 'MEMBER'}</Text>
              <View style={dynamicStyles.vipBadge}>
                <Ionicons name="star" size={12} color={Colors.gold[500]} />
                <Text style={dynamicStyles.vipText}>PREMIUM</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Katalog Tersedia</Text>

        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.gold[500]} />
          </View>
        ) : rewards.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons name="gift-outline" size={56} color={Colors.gold[400]} />
            <Text style={dynamicStyles.emptyStateTitle}>Belum Ada Hadiah</Text>
            <Text style={dynamicStyles.emptyStateDesc}>Katalog saat ini kosong. Terus kumpulkan poin Anda untuk hadiah mendatang!</Text>
          </View>
        ) : (
          <View style={dynamicStyles.grid}>
            {rewards.map((r) => {
              const canAfford = userPoints >= r.points_cost;
              const hasStock = r.stock > 0;
              const isProcessing = redeeming === r.id;
              
              return (
                <View key={r.id} style={dynamicStyles.rewardCardWrap}>
                  <View style={dynamicStyles.rewardCard}>
                    
                    {/* Premium Image Placeholder */}
                    <View style={dynamicStyles.imgPlaceholder}>
                      <LinearGradient 
                        colors={isDark ? ['rgba(250, 204, 21, 0.1)', 'rgba(250, 204, 21, 0.02)'] : [Colors.gold[50], Colors.white]}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={dynamicStyles.iconRing}>
                        <Ionicons name={getIconForCategory(r.category)} size={36} color={Colors.gold[500]} />
                      </View>
                      
                      {/* Stock Badge */}
                      <View style={[dynamicStyles.stockBadge, !hasStock && { backgroundColor: Colors.danger }]}>
                        <Text style={dynamicStyles.stockText}>{hasStock ? `Sisa: ${r.stock}` : 'Habis'}</Text>
                      </View>
                    </View>

                    <View style={dynamicStyles.cardContent}>
                      <Text style={dynamicStyles.rewardName} numberOfLines={2}>{r.name}</Text>
                      
                      <View style={dynamicStyles.footer}>
                        <View style={dynamicStyles.costTag}>
                          <Ionicons name="leaf" size={12} color={Colors.gold[600]} style={{ marginRight: 4 }} />
                          <Text style={dynamicStyles.costText}>{r.points_cost}</Text>
                        </View>
                        
                        {/* Capsule Button */}
                        <TouchableOpacity 
                          style={[
                            dynamicStyles.redeemBtn,
                            (!canAfford || !hasStock) && dynamicStyles.redeemBtnDisabled
                          ]}
                          activeOpacity={0.8}
                          disabled={!canAfford || !hasStock || isProcessing}
                          onPress={() => handleRedeem(r.id, r.name, r.points_cost)}
                        >
                          {isProcessing ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                          ) : (
                            <Text style={dynamicStyles.redeemBtnText}>Tukar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  ambientGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 300,
  },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: Spacing.xl, letterSpacing: -0.5 },
  
  // VIP Digital Wallet Card
  walletWrapper: {
    marginBottom: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    shadowColor: Colors.gold[700],
    shadowOpacity: isDark ? 0.3 : 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  walletCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  walletTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  walletBody: {
    marginBottom: Spacing['2xl'],
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  walletBalance: {
    color: Colors.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  walletCurrency: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletMemberName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  vipText: {
    color: Colors.gold[600],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  
  // Premium Voucher Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  rewardCardWrap: {
    width: '47.5%',
    ...Shadows.sm,
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowColor: Colors.gold[900],
  },
  rewardCard: { 
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius['xl'], 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.3)',
    overflow: 'hidden',
  },
  imgPlaceholder: { 
    height: 110, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  iconRing: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : Colors.gold[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  stockBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '800',
    color: isDark ? Colors.white : Colors.black,
  },
  cardContent: {
    padding: Spacing.md,
  },
  rewardName: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: colors.text,
    minHeight: 36,
    marginBottom: Spacing.sm,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  costTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : Colors.gold[50],
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  costText: { 
    fontSize: 13, 
    fontWeight: '900', 
    color: Colors.gold[600],
  },
  
  // Capsule Button
  redeemBtn: {
    backgroundColor: Colors.gold[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnDisabled: {
    backgroundColor: colors.surface2,
  },
  redeemBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: Spacing.lg,
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
