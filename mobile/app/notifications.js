import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Semua');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dynamicStyles = getStyles(colors, isDark);

  const filterTabs = ['Semua', 'Sistem']; // Simplified for now since we only have system broadcast

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put(`/users/notifications/${id}/read`);
      // Update local state without refetching immediately
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.log('Error marking as read:', error);
    }
  };

  const getIconForType = (type) => {
    if (type === 'transaction') return 'wallet';
    if (type === 'system') return 'megaphone';
    return 'notifications';
  };

  const getColorForType = (type) => {
    if (type === 'transaction') return Colors.green[500];
    if (type === 'system') return Colors.purple;
    return Colors.info;
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Hari ini, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Sistem' && n.type === 'system') return true;
    return false;
  });

  return (
    <View style={dynamicStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={dynamicStyles.headerCenter}>
          <Text style={dynamicStyles.headerTitle}>{t('notifications.title', {defaultValue: 'Notifikasi'})}</Text>
        </View>
        <View style={{ width: 24 }} />
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
      <ScrollView 
        style={dynamicStyles.listContainer} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        {loading && !refreshing ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            const color = getColorForType(notif.type);
            const icon = getIconForType(notif.type);
            return (
              <TouchableOpacity 
                key={notif.id} 
                style={[
                  dynamicStyles.notifCard, 
                  !notif.is_read && dynamicStyles.notifCardUnread
                ]}
                activeOpacity={0.7}
                onPress={() => handleRead(notif.id, notif.is_read)}
              >
                <View style={[dynamicStyles.iconBox, { backgroundColor: color + (isDark ? '30' : '15') }]}>
                  <Ionicons name={icon} size={24} color={color} />
                </View>
                
                <View style={dynamicStyles.contentBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={[dynamicStyles.title, !notif.is_read && dynamicStyles.titleUnread]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                    {!notif.is_read && <View style={dynamicStyles.unreadDot} />}
                  </View>
                  <Text style={dynamicStyles.message}>{notif.message}</Text>
                  <Text style={dynamicStyles.time}>{formatTime(notif.created_at)}</Text>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>{t('notifications.empty_title', {defaultValue: 'Belum ada notifikasi baru'})}</Text>
            <Text style={dynamicStyles.emptyDesc}>{t('notifications.empty_desc', {defaultValue: 'Notifikasi seputar transaksi dan aktivitas Anda akan muncul di sini.'})}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    backgroundColor: colors.bg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
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
