import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

export default function AdminDashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    productsCount: 0,
    successfulDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  const dynamicStyles = getStyles(colors, isDark);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.log('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      const interval = setInterval(fetchStats, 5000); // Polling every 5s for realtime updates
      return () => clearInterval(interval);
    }, [])
  );

  const adminMenu = [
    {
      title: 'Verifikasi Distrik',
      desc: 'Setujui pengajuan pendaftaran pengelola Distrik.',
      icon: 'shield-checkmark',
      route: '/admin/verify-distrik',
      color: Colors.error,
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      ring: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'
    },
    {
      title: 'Setoran Sampah',
      desc: 'Terima & tolak setoran sampah masuk dari warga.',
      icon: 'scan',
      route: '/admin/distrik',
      color: Colors.green[500],
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50],
      ring: isDark ? 'rgba(16, 185, 129, 0.3)' : Colors.green[100]
    },
    {
      title: 'Data Pengguna',
      desc: 'Pantau aktivitas, blokir, atau ubah peran akun.',
      icon: 'people',
      route: '/admin/users',
      color: Colors.info,
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
      ring: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE'
    },
    {
      title: 'Kelola ZISWAF',
      desc: 'Manajemen donasi, zakat, dan pelaporan program.',
      icon: 'heart',
      route: 'coming_soon',
      color: Colors.gold[500],
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : Colors.gold[50],
      ring: isDark ? 'rgba(245, 158, 11, 0.3)' : Colors.gold[100]
    },
    {
      title: 'Kelola E-Market',
      desc: 'Persetujuan produk UMKM & pantau transaksi.',
      icon: 'storefront',
      route: 'coming_soon',
      color: Colors.purple,
      bg: isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
      ring: isDark ? 'rgba(168, 85, 247, 0.3)' : '#E9D5FF'
    },
  ];

  const handleMenuPress = (route) => {
    if (route === 'coming_soon') {
      Alert.alert('Segera Hadir', 'Fitur ini sedang dalam tahap pengembangan.');
    } else {
      router.push(route);
    }
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Premium Header Background */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        {/* Welcome Section */}
        <View style={dynamicStyles.welcomeSection}>
          <View>
            <Text style={dynamicStyles.greeting}>Selamat Bekerja,</Text>
            <Text style={dynamicStyles.adminName}>{user?.display_name || 'Admin'}!</Text>
          </View>
          <View style={dynamicStyles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.gold[400]} />
            <Text style={dynamicStyles.adminBadgeText}>SUPER ADMIN</Text>
          </View>
        </View>
        
        {/* VIP Summary Card (Realtime) */}
        <View style={[dynamicStyles.summaryCardWrapper, Shadows.lg]}>
          <LinearGradient 
            colors={isDark ? ['#064E3B', '#022C22'] : [Colors.green[700], Colors.green[900]]} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }}
            style={dynamicStyles.summaryCard}
          >
            <View style={dynamicStyles.summaryHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={dynamicStyles.liveIndicator} />
                <Text style={dynamicStyles.summaryTitle}>LALU LINTAS SISTEM (REALTIME)</Text>
              </View>
              <Ionicons name="stats-chart" size={18} color={Colors.gold[400]} />
            </View>
            
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} style={{ marginVertical: 20 }} />
            ) : (
              <View style={dynamicStyles.statsRow}>
                <View style={dynamicStyles.statBox}>
                  <Text style={dynamicStyles.statVal}>{stats.pendingDeposits}</Text>
                  <Text style={dynamicStyles.statLbl}>Setoran{'\n'}Antre</Text>
                </View>
                <View style={dynamicStyles.statDivider} />
                <View style={dynamicStyles.statBox}>
                  <Text style={dynamicStyles.statVal}>{stats.productsCount}</Text>
                  <Text style={dynamicStyles.statLbl}>Produk{'\n'}UMKM</Text>
                </View>
                <View style={dynamicStyles.statDivider} />
                <View style={dynamicStyles.statBox}>
                  <Text style={dynamicStyles.statVal}>{stats.successfulDonations}</Text>
                  <Text style={dynamicStyles.statLbl}>ZISWAF{'\n'}Berhasil</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Pusat Kendali</Text>
        
        {/* Premium Menu Grid */}
        <View style={dynamicStyles.menuGrid}>
          {adminMenu.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={dynamicStyles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.menuIconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={dynamicStyles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  container: { padding: Spacing.xl },
  welcomeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['2xl'], marginTop: Spacing.md },
  greeting: { fontSize: 14, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  adminName: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(250, 204, 21, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(250, 204, 21, 0.3)', gap: 6 },
  adminBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.gold[500], letterSpacing: 1 },

  summaryCardWrapper: { marginBottom: Spacing['2xl'], borderRadius: BorderRadius['2xl'], shadowColor: Colors.green[800], shadowOpacity: isDark ? 0.3 : 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  summaryCard: { borderRadius: BorderRadius['2xl'], padding: Spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['xl'] },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  summaryTitle: { fontSize: 11, fontWeight: '800', color: Colors.gold[400], letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 32, fontWeight: '900', color: Colors.white, marginBottom: 6, letterSpacing: -1 },
  statLbl: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, justifyContent: 'flex-start' },
  menuItem: { width: '33.33%', alignItems: 'center', marginBottom: Spacing.xl },
  menuIconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  menuTitle: { fontSize: 11.5, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 4, paddingHorizontal: 4 }
});
