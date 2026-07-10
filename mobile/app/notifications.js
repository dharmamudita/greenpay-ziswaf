import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

const dummyNotifications = [
  {
    id: '1',
    title: 'Pembayaran ZISWAF Berhasil',
    message: 'Alhamdulillah, donasi Zakat Anda sebesar Rp 250.000 telah berhasil diproses.',
    time: '2 jam yang lalu',
    type: 'transaction',
    isRead: false,
    icon: 'wallet',
    color: Colors.green[500]
  },
  {
    id: '2',
    title: 'Green Point Bertambah! 🍃',
    message: 'Selamat! Anda mendapatkan 50 Green Point dari penukaran 2 Kg Botol Plastik di Bank Sampah Berkah.',
    time: 'Kemarin',
    type: 'system',
    isRead: false,
    icon: 'leaf',
    color: Colors.gold[500]
  },
  {
    id: '3',
    title: 'Peringkat Anda Naik 🏆',
    message: 'Luar biasa! Anda sekarang berada di peringkat 10 besar Pahlawan Bumi bulan ini.',
    time: '3 hari yang lalu',
    type: 'system',
    isRead: true,
    icon: 'trophy',
    color: Colors.info
  },
  {
    id: '4',
    title: 'Kampanye Baru: Tanam 1000 Pohon',
    message: 'Mari berpartisipasi dalam kampanye penanaman pohon mangrove di pesisir Demak.',
    time: '1 minggu yang lalu',
    type: 'system',
    isRead: true,
    icon: 'megaphone',
    color: Colors.purple
  }
];

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Semua');
  const dynamicStyles = getStyles(colors, isDark);

  const filterTabs = ['Semua', 'Transaksi', 'Sistem'];

  const filteredNotifs = dummyNotifications.filter(n => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Transaksi' && n.type === 'transaction') return true;
    if (activeTab === 'Sistem' && n.type === 'system') return true;
    return false;
  });

  return (
    <View style={dynamicStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 24 }} /> {/* Empty view for centering */}
      </View>

      {/* Tabs */}
      <View style={dynamicStyles.tabsContainer}>
        {filterTabs.map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[dynamicStyles.tabBtn, activeTab === tab && dynamicStyles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[dynamicStyles.tabText, activeTab === tab && dynamicStyles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView style={dynamicStyles.listContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <TouchableOpacity 
              key={notif.id} 
              style={[
                dynamicStyles.notifCard, 
                !notif.isRead && dynamicStyles.notifCardUnread
              ]}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.iconBox, { backgroundColor: notif.color + (isDark ? '30' : '15') }]}>
                <Ionicons name={notif.icon} size={24} color={notif.color} />
              </View>
              
              <View style={dynamicStyles.contentBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text style={[dynamicStyles.title, !notif.isRead && dynamicStyles.titleUnread]} numberOfLines={1}>
                    {notif.title}
                  </Text>
                  {!notif.isRead && <View style={dynamicStyles.unreadDot} />}
                </View>
                <Text style={dynamicStyles.message} numberOfLines={2}>{notif.message}</Text>
                <Text style={dynamicStyles.time}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>Belum ada notifikasi baru</Text>
            <Text style={dynamicStyles.emptyDesc}>Notifikasi seputar transaksi dan aktivitas Anda akan muncul di sini.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDark ? colors.surface : Colors.gray[200],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: Colors.green[500] + '15', // very light matcha green
    borderColor: Colors.green[500],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: Colors.green[500], // Match primary color
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifCardUnread: {
    backgroundColor: isDark ? colors.surface2 : Colors.white,
    borderColor: isDark ? Colors.green[800] : Colors.green[100],
    ...Shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contentBox: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginTop: 6,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isDark ? colors.surface : Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  }
});
