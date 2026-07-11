import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, SafeAreaView, Platform, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import authService from '../../services/authService';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, isAdmin, isDistrik, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [isPhotoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dynamicStyles = getStyles(colors, isDark);

  const passportIdStr = user?.passport_id ? String(user.passport_id).padStart(8, '0') : '00000000';

  const copyPassportId = async () => {
    await Clipboard.setStringAsync(passportIdStr);
    Alert.alert('Disalin!', `ID ${passportIdStr} berhasil disalin ke clipboard.`);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, []);

  // --- UNAUTHENTICATED STATE (Hero Onboarding Style) ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={dynamicStyles.unauthScreen}>
        <View style={dynamicStyles.unauthContent}>
          {/* Hero Illustration Placeholder */}
          <View style={dynamicStyles.unauthIconGlow}>
            <View style={dynamicStyles.unauthIconCircle}>
              <Ionicons name="leaf" size={64} color={Colors.white} />
            </View>
          </View>
          
          <Text style={dynamicStyles.unauthTitle}>{t('profile.unauth_title', { defaultValue: 'Bergabung dengan Gerakan Hijau' })}</Text>
          <Text style={dynamicStyles.unauthDesc}>
            {t('profile.unauth_desc', { defaultValue: 'Masuk sekarang untuk melacak donasi, menukar poin, dan berpartisipasi menjaga bumi.' })}
          </Text>
        </View>

        <View style={dynamicStyles.unauthFooter}>
          <TouchableOpacity 
            style={dynamicStyles.unauthLoginBtn} 
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.unauthLoginText}>{t('profile.unauth_btn', { defaultValue: 'Masuk / Daftar Sekarang' })}</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- AUTHENTICATED STATE ---
  let menuItems = [];

  if (isAdmin()) {
    menuItems.push({ icon: 'briefcase', label: t('profile.admin_dashboard', { defaultValue: 'Dashboard Admin' }), route: '/admin', color: Colors.gold[500] });
  } else if (isDistrik()) {
    menuItems.push({ icon: 'business', label: t('profile.district_panel', { defaultValue: 'Panel Distrik' }), route: '/distrik', color: Colors.info });
  }

  menuItems.push(
    { icon: 'document-text', label: t('profile.impact_passport', { defaultValue: 'Impact Passport' }), route: '/impact-passport', color: Colors.pink },
    { icon: 'bar-chart', label: t('profile.impact_dashboard', { defaultValue: 'Dashboard Dampak' }), route: '/dashboard-dampak', color: Colors.purple },
    { icon: 'refresh', label: t('profile.waste_bank', { defaultValue: 'Bank Sampah' }), route: '/bank-sampah', color: Colors.green[500] }
  );

  if (user?.role === 'user') {
    menuItems.push({ icon: 'business', label: t('profile.register_district', { defaultValue: 'Daftar Jadi Distrik' }), route: '/profile/register-distrik', color: Colors.info });
  }

  menuItems.push({ icon: 'settings', label: t('settings.title', { defaultValue: 'Pengaturan' }), route: '/settings', color: isDark ? Colors.gray[400] : Colors.gray[500] });

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
      >
        
        <View style={dynamicStyles.container}>
          {/* Unified Profile Card with Cover Background */}
          <View style={dynamicStyles.profileCard}>
            {/* Background Image / Gradient */}
            {user?.cover_photo_url ? (
              <Image source={{ uri: user.cover_photo_url }} style={StyleSheet.absoluteFillObject} />
            ) : (
              <LinearGradient 
                colors={[isDark ? 'rgba(16, 185, 129, 0.2)' : Colors.green[100], isDark ? colors.surface : Colors.green[50]]} 
                style={StyleSheet.absoluteFillObject}
              />
            )}
            
            {/* Overlay for readability */}
            <LinearGradient 
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']} 
              style={StyleSheet.absoluteFillObject}
            />

          {/* Profile Content inside the Card */}
          <View style={dynamicStyles.profileCardContent}>
            <TouchableOpacity 
              style={dynamicStyles.avatarOuter}
              onPress={() => setPhotoViewerVisible(true)}
              activeOpacity={0.8}
            >
              {user?.photo_url ? (
                <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatar} />
              ) : (
                <View style={dynamicStyles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
            
            <View style={dynamicStyles.userInfoCol}>
              <Text style={dynamicStyles.userName} numberOfLines={1}>{user?.display_name || t('profile.user', { defaultValue: 'Pengguna' })}</Text>
              
              <TouchableOpacity 
                style={dynamicStyles.idBorderWrap}
                onPress={copyPassportId}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.userIdText}>
                  ID: {passportIdStr}
                </Text>
                <Ionicons name="copy-outline" size={14} color={Colors.white} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              
              <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Badge 
                  text={user?.role === 'admin' ? t('profile.role_admin', { defaultValue: 'Administrator' }) : user?.role === 'distrik' ? t('profile.role_district', { defaultValue: 'Akun Distrik' }) : t('profile.role_user', { defaultValue: 'Pengguna Aktif' })} 
                  variant={user?.role === 'admin' ? 'gold' : 'primary'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Fintech-style Stats */}
        <View style={dynamicStyles.statsRow}>
          {[
            { label: t('green_point.title', { defaultValue: 'Green Point' }), value: user?.green_points || 0, icon: 'leaf', color: Colors.green[500], bg: isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50] },
            { label: t('home.donasi', { defaultValue: 'Donasi' }), value: `${((user?.total_donation || 0) / 1000).toFixed(0)}K`, icon: 'heart', color: Colors.gold[500], bg: isDark ? 'rgba(245, 158, 11, 0.15)' : Colors.gold[50] },
            { label: t('home.sampah', { defaultValue: 'Sampah' }), value: `${user?.total_waste || 0} kg`, icon: 'sync', color: Colors.info, bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' },
          ].map((s, i) => (
            <View key={i} style={dynamicStyles.statItem}>
              <View style={[dynamicStyles.statIconWrap, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={dynamicStyles.statValue}>{s.value}</Text>
              <Text style={dynamicStyles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Premium Menu Group */}
        <Text style={dynamicStyles.sectionTitle}>{t('profile.menu_title', { defaultValue: 'Menu Utama' })}</Text>
        <View style={dynamicStyles.menuGroup}>
          {menuItems.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                dynamicStyles.menuItem, 
                i !== menuItems.length - 1 && dynamicStyles.menuItemBorder 
              ]} 
              onPress={() => router.push(item.route)} 
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.menuIcon, { backgroundColor: isDark ? item.color + '15' : item.color + '10' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={dynamicStyles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Elegant Logout Button */}
        <TouchableOpacity style={dynamicStyles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={dynamicStyles.logoutText}>{t('profile.logout', { defaultValue: 'Keluar dari Akun' })}</Text>
        </TouchableOpacity>
        
        <Text style={dynamicStyles.versionText}>
          GreenPay ZISWAF v1.0.0
        </Text>
      </View>

      {/* Photo Viewer Modal */}
      <Modal visible={isPhotoViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setPhotoViewerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setPhotoViewerVisible(false)}>
          <View style={dynamicStyles.modalOverlay}>
            <TouchableOpacity style={dynamicStyles.closeModalBtn} onPress={() => setPhotoViewerVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
            <TouchableWithoutFeedback>
              <View style={dynamicStyles.modalContent}>
                {user?.photo_url ? (
                  <Image source={{ uri: user.photo_url }} style={dynamicStyles.modalImage} resizeMode="contain" />
                ) : (
                  <View style={[dynamicStyles.modalImagePlaceholder, { backgroundColor: Colors.green[500] }]}>
                    <Ionicons name="person" size={160} color={Colors.white} />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: Spacing.xl, paddingBottom: 100, paddingTop: 40 },
  
  // Unified Profile Card
  profileCard: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isDark ? colors.surface : Colors.green[50],
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing['2xl'],
    marginTop: 20,
    ...Shadows.md,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  avatarOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.lg,
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  userInfoCol: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  userName: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  idBorderWrap: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIdText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Stats Row
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.04,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statIconWrap: { 
    width: 44, 
    height: 44, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  
  // Menu Group
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.lg,
    marginLeft: 4,
  },
  menuGroup: { 
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: Spacing['2xl'],
    ...Shadows.sm,
    shadowOpacity: 0.02,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: 16 
  },
  menuItemBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: isDark ? colors.border : Colors.gray[100] 
  },
  menuIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: Spacing.md 
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  
  // Logout Button
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: { color: isDark ? '#FCA5A5' : Colors.error, fontSize: 15, fontWeight: '800' },

  versionText: { 
    textAlign: "center", 
    color: colors.textMuted, 
    marginTop: Spacing['2xl'], 
    marginBottom: Spacing.xl, 
    fontSize: 12, 
    fontWeight: '600' 
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width, height: width, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: width, height: width },
  modalImagePlaceholder: { width: width, height: width, justifyContent: 'center', alignItems: 'center' },
  modalImagePlaceholderText: { fontSize: 140, fontWeight: '900', color: Colors.white },
  closeModalBtn: { position: 'absolute', top: 50, right: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },

  // Unauth State
  unauthScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between', padding: Spacing.xl },
  unauthContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unauthIconGlow: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  unauthIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.green[500], justifyContent: 'center', alignItems: 'center', ...Shadows.md },
  unauthTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: Spacing.md, textAlign: 'center' },
  unauthDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
  unauthFooter: { paddingBottom: Spacing.xl },
  unauthLoginBtn: { backgroundColor: Colors.green[500], paddingVertical: 16, borderRadius: BorderRadius.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...Shadows.sm },
  unauthLoginText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
