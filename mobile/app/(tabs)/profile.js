import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredScreen}>
        <Ionicons name="person-circle-outline" size={80} color={Colors.gray[600]} />
        <Text style={styles.noAuthTitle}>Belum Masuk</Text>
        <Text style={styles.noAuthDesc}>Silakan login untuk melihat profil Anda.</Text>
        <Button title="Masuk" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  const menuItems = [
    { icon: 'document-text', label: 'Impact Passport', route: '/impact-passport', color: Colors.pink },
    { icon: 'bar-chart', label: 'Dashboard Dampak', route: '/dashboard-dampak', color: Colors.purple },
    { icon: 'gift', label: 'Reward Saya', route: '/reward', color: Colors.gold[400] },
    { icon: 'refresh-circle', label: 'Bank Sampah', route: '/bank-sampah', color: Colors.green[500] },
    { icon: 'settings', label: 'Pengaturan', route: '/', color: Colors.gray[400] },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={[Colors.green[600], Colors.green[500]]} style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.display_name || 'Pengguna'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Badge text={user?.role === 'admin' ? 'Admin' : user?.role === 'distrik' ? 'Distrik' : 'Pengguna'} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Green Point', value: user?.green_points || 0, icon: 'leaf', color: Colors.green[400] },
            { label: 'Donasi', value: `${((user?.total_donation || 0) / 1000).toFixed(0)}K`, icon: 'heart', color: Colors.gold[400] },
            { label: 'Sampah (kg)', value: user?.total_waste || 0, icon: 'refresh', color: Colors.info },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => router.push(item.route)} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.gray[600]} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Keluar" variant="outline" onPress={logout} style={{ marginTop: Spacing.xl }}
          textStyle={{ color: Colors.error }} icon={<Ionicons name="log-out-outline" size={18} color={Colors.error} />} />
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  centeredScreen: { flex: 1, backgroundColor: Colors.dark.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  noAuthTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  noAuthDesc: { fontSize: 14, color: Colors.gray[400], textAlign: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.xs },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.white },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 13, color: Colors.gray[400] },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statItem: { flex: 1, backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.gray[500] },
  menu: { gap: Spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.white },
});
