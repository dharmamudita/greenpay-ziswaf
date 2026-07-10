import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, isAdmin, isDistrik } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [isPhotoViewerVisible, setPhotoViewerVisible] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

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
          
          <Text style={dynamicStyles.unauthTitle}>Bergabung dengan Gerakan Hijau</Text>
          <Text style={dynamicStyles.unauthDesc}>
            Masuk sekarang untuk melacak donasi, menukar poin, dan berpartisipasi menjaga bumi.
          </Text>
        </View>

        <View style={dynamicStyles.unauthFooter}>
          <TouchableOpacity 
            style={dynamicStyles.unauthLoginBtn} 
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.unauthLoginText}>Masuk / Daftar Sekarang</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- AUTHENTICATED STATE ---
  let menuItems = [
    { icon: 'document-text', label: t('profile.impact_passport', { defaultValue: 'Impact Passport' }), route: '/impact-passport', color: Colors.pink },
    { icon: 'bar-chart', label: t('profile.impact_dashboard', { defaultValue: 'Dashboard Dampak' }), route: '/dashboard-dampak', color: Colors.purple },
    { icon: 'gift', label: t('profile.my_rewards', { defaultValue: 'Reward Saya' }), route: '/reward', color: Colors.gold[500] },
    { icon: 'refresh', label: t('profile.waste_bank', { defaultValue: 'Bank Sampah' }), route: '/bank-sampah', color: Colors.green[500] },
  ];

  if (user?.role === 'user') {
    menuItems.push({ icon: 'business', label: 'Daftar Jadi Distrik', route: '/profile/register-distrik', color: Colors.info });
  }

  if (isAdmin() || isDistrik()) {
    menuItems.push({ icon: 'briefcase', label: 'Dashboard Admin', route: '/admin', color: Colors.gold[500] });
  }

  menuItems.push({ icon: 'settings', label: t('settings.title', { defaultValue: 'Pengaturan' }), route: '/settings', color: isDark ? Colors.gray[400] : Colors.gray[500] });

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Premium Header Background (Seamless) */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        {/* Avatar Section (Glowing) */}
        <View style={dynamicStyles.avatarSection}>
          <TouchableOpacity 
            style={dynamicStyles.avatarGlowContainer}
            onPress={() => setPhotoViewerVisible(true)}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.avatarOuter}>
              {user?.photo_url ? (
                <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatar} />
              ) : (
                <View style={dynamicStyles.avatarPlaceholder}>
                  <Text style={dynamicStyles.avatarText}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={dynamicStyles.userName}>{user?.display_name || 'Pengguna'}</Text>
          <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
          
          <View style={{ marginTop: 12 }}>
            <Badge 
              text={user?.role === 'admin' ? 'Administrator' : user?.role === 'distrik' ? 'Akun Distrik' : 'Pengguna Aktif'} 
              variant={user?.role === 'admin' ? 'gold' : 'primary'}
            />
          </View>
        </View>

        {/* Fintech-style Stats */}
        <View style={dynamicStyles.statsRow}>
          {[
            { label: 'Green Point', value: user?.green_points || 0, icon: 'leaf', color: Colors.green[500], bg: isDark ? 'rgba(16, 185, 129, 0.15)' : Colors.green[50] },
            { label: 'Donasi', value: `${((user?.total_donation || 0) / 1000).toFixed(0)}K`, icon: 'heart', color: Colors.gold[500], bg: isDark ? 'rgba(245, 158, 11, 0.15)' : Colors.gold[50] },
            { label: 'Sampah', value: `${user?.total_waste || 0} kg`, icon: 'sync', color: Colors.info, bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' },
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
        <Text style={dynamicStyles.sectionTitle}>Menu Utama</Text>
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
                    <Text style={dynamicStyles.modalImagePlaceholderText}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  
  // Header Background
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 250,
  },
  
  container: { padding: Spacing.xl, paddingTop: Spacing['3xl'] },
  
  // Unauthenticated State (Hero Onboarding)
  unauthScreen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  unauthContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  unauthIconGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  unauthIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
    shadowColor: Colors.green[500],
  },
  unauthTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  unauthDesc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  unauthFooter: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
  },
  unauthLoginBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.green[500],
    paddingVertical: 18,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    shadowColor: Colors.green[500],
  },
  unauthLoginText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },

  // Authenticated State - Avatar
  avatarSection: { alignItems: 'center', marginBottom: Spacing['2xl'], zIndex: 10 },
  avatarGlowContainer: {
    borderRadius: 60,
    backgroundColor: colors.bg,
    padding: 6,
    marginBottom: Spacing.md,
    ...Shadows.lg,
    shadowColor: Colors.green[500],
    shadowOpacity: isDark ? 0.2 : 0.15,
    shadowRadius: 15,
  },
  avatarOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: isDark ? colors.surface2 : Colors.gray[100],
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  userName: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  
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
  closeModalBtn: { position: 'absolute', top: 50, right: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
});
