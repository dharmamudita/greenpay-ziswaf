import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function DistrikDashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const dynamicStyles = getStyles(colors, isDark);

  const capacityUsed = 750; // Mock data
  const capacityMax = 1000;
  const capacityPercent = (capacityUsed / capacityMax) * 100;

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Header Background */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(59, 130, 246, 0.15)' : Colors.info + '20', colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        {/* Top Bar */}
        <View style={dynamicStyles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={dynamicStyles.headerTextWrap}>
            <Text style={dynamicStyles.pageTitle}>Panel Distrik</Text>
          </View>
        </View>

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
                <Text style={dynamicStyles.heroTitle}>Bank Sampah Berkah</Text>
                <Text style={dynamicStyles.heroSubtitle}>ID: DISTRIK-001</Text>
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
                <Text style={dynamicStyles.capacityLabel}>Kapasitas Gudang</Text>
                <Text style={dynamicStyles.capacityValue}>{capacityUsed} / {capacityMax} Kg</Text>
              </View>
              <View style={dynamicStyles.progressBarBg}>
                <View style={[dynamicStyles.progressBarFill, { width: `${capacityPercent}%`, backgroundColor: capacityPercent > 80 ? Colors.danger : Colors.green[400] }]} />
              </View>
              {capacityPercent > 80 && (
                <Text style={dynamicStyles.warningText}>Gudang hampir penuh! Segera jual ke pusat.</Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions / Widgets */}
        <Text style={dynamicStyles.sectionTitle}>Pusat Kendali</Text>
        <View style={dynamicStyles.widgetGrid}>
          
          <TouchableOpacity style={dynamicStyles.widgetCard} activeOpacity={0.7} onPress={() => {}}>
            <View style={[dynamicStyles.widgetIconWrap, { backgroundColor: Colors.gold[500] }]}>
              <Ionicons name="scan" size={24} color={Colors.white} />
            </View>
            <Text style={dynamicStyles.widgetTitle}>Verifikasi Setoran</Text>
            <View style={dynamicStyles.badgeIndicator}>
              <Text style={dynamicStyles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.widgetCard} activeOpacity={0.7} onPress={() => {}}>
            <View style={[dynamicStyles.widgetIconWrap, { backgroundColor: Colors.purple }]}>
              <Ionicons name="layers" size={24} color={Colors.white} />
            </View>
            <Text style={dynamicStyles.widgetTitle}>Inventaris Gudang</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.widgetCard} activeOpacity={0.7} onPress={() => {}}>
            <View style={[dynamicStyles.widgetIconWrap, { backgroundColor: Colors.green[500] }]}>
              <Ionicons name="car" size={24} color={Colors.white} />
            </View>
            <Text style={dynamicStyles.widgetTitle}>Jual ke Pusat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.widgetCard} activeOpacity={0.7} onPress={() => {}}>
            <View style={[dynamicStyles.widgetIconWrap, { backgroundColor: Colors.gray[500] }]}>
              <Ionicons name="stats-chart" size={24} color={Colors.white} />
            </View>
            <Text style={dynamicStyles.widgetTitle}>Laporan Keuangan</Text>
          </TouchableOpacity>

        </View>

        {/* Recent Pending Deposits */}
        <View style={dynamicStyles.listHeader}>
          <Text style={dynamicStyles.sectionTitle}>Setoran Menunggu Verifikasi</Text>
          <TouchableOpacity>
            <Text style={dynamicStyles.seeAllBtn}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.depositList}>
          {/* Mock Item 1 */}
          <View style={dynamicStyles.depositItem}>
            <View style={[dynamicStyles.depositIcon, { backgroundColor: Colors.info + '20' }]}>
              <Ionicons name="water" size={24} color={Colors.info} />
            </View>
            <View style={dynamicStyles.depositInfo}>
              <Text style={dynamicStyles.depositUser}>Ahmad Fulan</Text>
              <Text style={dynamicStyles.depositDetail}>Plastik • 2.5 Kg</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.verifyBtn}>
              <Text style={dynamicStyles.verifyBtnText}>Tinjau</Text>
            </TouchableOpacity>
          </View>

          {/* Mock Item 2 */}
          <View style={dynamicStyles.depositItem}>
            <View style={[dynamicStyles.depositIcon, { backgroundColor: Colors.gold[400] + '20' }]}>
              <Ionicons name="document-text" size={24} color={Colors.gold[400]} />
            </View>
            <View style={dynamicStyles.depositInfo}>
              <Text style={dynamicStyles.depositUser}>Siti Aisyah</Text>
              <Text style={dynamicStyles.depositDetail}>Kertas • 12 Kg</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.verifyBtn}>
              <Text style={dynamicStyles.verifyBtnText}>Tinjau</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  container: { padding: Spacing.xl, paddingTop: Spacing.xl },
  
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  headerTextWrap: { flex: 1 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

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

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: Spacing.md, letterSpacing: -0.5 },
  
  // Widget Grid
  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: Spacing['2xl'] },
  widgetCard: { width: '47%', backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: colors.border, ...Shadows.sm },
  widgetIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  widgetTitle: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  badgeIndicator: { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.danger, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },

  // List
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  seeAllBtn: { color: Colors.info, fontSize: 13, fontWeight: '700' },
  depositList: { gap: Spacing.md },
  depositItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: colors.border },
  depositIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  depositInfo: { flex: 1 },
  depositUser: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  depositDetail: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  verifyBtn: { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : Colors.info + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full },
  verifyBtnText: { color: Colors.info, fontSize: 12, fontWeight: '800' },
});
