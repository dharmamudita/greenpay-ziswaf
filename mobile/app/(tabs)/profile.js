import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { uploadToCloudinary } from '../../utils/cloudinary';
import authService from '../../services/authService';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

  if (!isAuthenticated) {
    return (
      <View style={dynamicStyles.centeredScreen}>
        <Ionicons name="person-circle-outline" size={80} color={colors.textMuted} />
        <Text style={dynamicStyles.noAuthTitle}>{t('settings.title', { defaultValue: 'Belum Masuk' })}</Text>
        <Text style={dynamicStyles.noAuthDesc}>Silakan login untuk melihat profil Anda.</Text>
        <Button title="Masuk" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  const handleUpdateAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Ditolak', 'Anda perlu mengizinkan akses galeri untuk mengubah foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Kompresi untuk menghemat data
      });

      if (!result.canceled) {
        setUploadingAvatar(true);
        const imageUrl = await uploadToCloudinary(result.assets[0].uri);
        
        await authService.updateProfile({ photo_url: imageUrl });
        await refreshProfile(); // Perbarui state user global
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengunggah foto profil.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const menuItems = [
    { icon: 'document-text', label: 'Impact Passport', route: '/impact-passport', color: Colors.pink },
    { icon: 'bar-chart', label: 'Dashboard Dampak', route: '/dashboard-dampak', color: Colors.purple },
    { icon: 'gift', label: 'Reward Saya', route: '/reward', color: Colors.gold[400] },
    { icon: 'refresh-circle', label: 'Bank Sampah', route: '/bank-sampah', color: Colors.green[500] },
    { icon: 'settings', label: t('settings.title', { defaultValue: 'Pengaturan' }), route: '/settings', color: isDark ? Colors.gray[300] : Colors.gray[600] },
  ];

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Premium Gradient Header Background */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[Colors.green[600], isDark ? colors.bg : Colors.green[50]]} 
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <View style={dynamicStyles.container}>
        {/* Avatar Section */}
        <View style={dynamicStyles.avatarSection}>
          <TouchableOpacity 
            style={[dynamicStyles.avatarOuter, Shadows.md, { backgroundColor: colors.bg }]} 
            onPress={handleUpdateAvatar} 
            activeOpacity={0.8}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <View style={dynamicStyles.avatar}>
                <ActivityIndicator size="large" color={Colors.green[500]} />
              </View>
            ) : user?.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={dynamicStyles.avatar} />
            ) : (
              <LinearGradient colors={[Colors.green[400], Colors.green[600]]} style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{user?.display_name?.[0]?.toUpperCase() || 'U'}</Text>
              </LinearGradient>
            )}
            <View style={dynamicStyles.cameraBadge}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={dynamicStyles.userName}>{user?.display_name || 'Pengguna'}</Text>
          <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
          <View style={{ marginTop: 8 }}>
            <Badge text={user?.role === 'admin' ? 'Administrator' : user?.role === 'distrik' ? 'Akun Distrik' : 'Pengguna Aktif'} />
          </View>
        </View>

        {/* Stats */}
        <View style={[dynamicStyles.statsRow, Shadows.sm]}>
          {[
            { label: 'Green Point', value: user?.green_points || 0, icon: 'leaf', color: Colors.green[500] },
            { label: 'Donasi', value: `${((user?.total_donation || 0) / 1000).toFixed(0)}K`, icon: 'heart', color: Colors.gold[400] },
            { label: 'Sampah', value: `${user?.total_waste || 0} kg`, icon: 'refresh', color: Colors.info },
          ].map((s, i) => (
            <View key={i} style={dynamicStyles.statItem}>
              <View style={[dynamicStyles.statIconWrap, { backgroundColor: isDark ? s.color + '15' : s.color + '10' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={[dynamicStyles.statValue, { color: isDark ? Colors.white : Colors.black }]}>{s.value}</Text>
              <Text style={dynamicStyles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items (Grouped iOS Style) */}
        <View style={[dynamicStyles.menuGroup, Shadows.sm]}>
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
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[dynamicStyles.logoutBtn, Shadows.sm]} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={isDark ? '#FCA5A5' : Colors.error} />
          <Text style={dynamicStyles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
        
        <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: Spacing['2xl'], marginBottom: Spacing.xl, fontSize: 12, fontWeight: '600' }}>
          GreenPay ZISWAF v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: isDark ? 0.3 : 1,
  },
  container: { padding: Spacing.xl, paddingTop: Spacing['2xl'] },
  
  centeredScreen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  noAuthTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  noAuthDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl, zIndex: 10 },
  avatarOuter: { padding: 4, borderRadius: 50, marginBottom: Spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: Colors.green[500], 
    padding: 6, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: colors.bg,
    zIndex: 2,
  },
  userName: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: colors.surface,
    borderRadius: BorderRadius['2xl'],
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  
  menuGroup: { 
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius['2xl'], 
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingVertical: Spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.03)' },
  menuIcon: { width: 38, height: 38, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
    padding: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA',
    marginTop: Spacing.md,
  },
  logoutText: { color: isDark ? '#FCA5A5' : Colors.error, fontSize: 15, fontWeight: '800' },
});
