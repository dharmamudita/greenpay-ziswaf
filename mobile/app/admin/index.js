import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function AdminDashboardScreen() {
  const { colors, isDark } = useTheme();
  
  const dynamicStyles = getStyles(colors, isDark);

  const adminMenu = [
    {
      title: 'Verifikasi Setoran',
      desc: 'Terima dan tolak setoran sampah masuk dari warga.',
      icon: 'scan',
      route: '/admin/distrik',
      color: Colors.green[500],
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50],
    },
    {
      title: 'Kelola ZISWAF',
      desc: 'Manajemen program donasi, zakat, dan laporan.',
      icon: 'heart',
      route: 'coming_soon',
      color: Colors.gold[500],
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : Colors.gold[50],
    },
    {
      title: 'Kelola Pasar (E-Market)',
      desc: 'Persetujuan produk UMKM dan pemantauan transaksi.',
      icon: 'storefront',
      route: 'coming_soon',
      color: Colors.purple,
      bg: isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
    },
    {
      title: 'Manajemen Pengguna',
      desc: 'Pantau aktivitas, blokir, atau ubah role pengguna.',
      icon: 'people',
      route: 'coming_soon',
      color: Colors.info,
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
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
      <View style={dynamicStyles.container}>
        
        {/* Header Summary */}
        <View style={dynamicStyles.summaryCard}>
          <View style={dynamicStyles.summaryHeader}>
            <Text style={dynamicStyles.summaryTitle}>Ringkasan Sistem</Text>
            <Ionicons name="stats-chart" size={20} color={Colors.white} />
          </View>
          
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statBox}>
              <Text style={dynamicStyles.statVal}>12</Text>
              <Text style={dynamicStyles.statLbl}>Setoran Antre</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statBox}>
              <Text style={dynamicStyles.statVal}>4</Text>
              <Text style={dynamicStyles.statLbl}>Produk Baru</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statBox}>
              <Text style={dynamicStyles.statVal}>8</Text>
              <Text style={dynamicStyles.statLbl}>Laporan ZISWAF</Text>
            </View>
          </View>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Pusat Kendali</Text>
        
        <View style={dynamicStyles.menuGrid}>
          {adminMenu.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={dynamicStyles.menuCard}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.iconWrapper, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={dynamicStyles.menuTitle}>{item.title}</Text>
              <Text style={dynamicStyles.menuDesc} numberOfLines={2}>{item.desc}</Text>
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
  container: { padding: Spacing.xl },
  
  // Summary Card
  summaryCard: {
    backgroundColor: Colors.green[600],
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    ...Shadows.md,
    shadowColor: Colors.green[600],
    shadowOpacity: isDark ? 0 : 0.3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.lg,
  },
  
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.04,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  menuDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  }
});
