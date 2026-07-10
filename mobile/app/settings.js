import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { themeMode, colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  const dynamicStyles = getStyles(colors, isDark);

  const getThemeName = () => {
    switch (themeMode) {
      case 'dark': return t('settings.theme_dark');
      case 'light': return t('settings.theme_light');
      default: return t('settings.theme_system');
    }
  };

  const getLanguageName = () => {
    return i18n.language === 'id' ? t('settings.lang_id') : t('settings.lang_en');
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      {/* Premium Header Background */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        <View style={dynamicStyles.pageHeader}>
          <Text style={dynamicStyles.pageTitle}>Pusat Kendali</Text>
          <Text style={dynamicStyles.pageDesc}>Sesuaikan pengalaman aplikasi Anda</Text>
        </View>

        {/* Akun */}
        <Text style={dynamicStyles.sectionTitle}>Akun Saya</Text>
        <View style={[dynamicStyles.card, Shadows.sm]}>
          <TouchableOpacity 
            style={[dynamicStyles.optionRow, { borderBottomWidth: 0 }]} 
            onPress={() => router.push('/settings/account')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: Colors.green[500] }]}>
                <Ionicons name="person" size={18} color={Colors.white} />
              </View>
              <Text style={dynamicStyles.optionTitle}>{t('settings.account')}</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>{t('settings.edit_data')}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.5 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tampilan & Bahasa */}
        <Text style={dynamicStyles.sectionTitle}>Preferensi Sistem</Text>
        <View style={[dynamicStyles.card, Shadows.sm]}>
          <TouchableOpacity 
            style={dynamicStyles.optionRow} 
            onPress={() => router.push('/settings/theme')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: Colors.info }]}>
                <Ionicons name="color-palette" size={18} color={Colors.white} />
              </View>
              <Text style={dynamicStyles.optionTitle}>{t('settings.theme')}</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>{getThemeName()}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.5 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.optionRow, { borderBottomWidth: 0 }]} 
            onPress={() => router.push('/settings/language')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: Colors.gold[500] }]}>
                <Ionicons name="language" size={18} color={Colors.white} />
              </View>
              <Text style={dynamicStyles.optionTitle}>{t('settings.language')}</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>{getLanguageName()}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.5 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Keamanan & Lainnya */}
        <Text style={dynamicStyles.sectionTitle}>Akses</Text>
        <View style={[dynamicStyles.card, Shadows.sm]}>
          <TouchableOpacity 
            style={[dynamicStyles.optionRow, { borderBottomWidth: 0 }]} 
            onPress={logout}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: Colors.danger }]}>
                <Ionicons name="log-out" size={18} color={Colors.white} />
              </View>
              <Text style={[dynamicStyles.optionTitle, { color: Colors.danger }]}>Keluar Aplikasi</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.5 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Premium System Footer */}
        <View style={dynamicStyles.footerContainer}>
          <Ionicons name="leaf" size={32} color={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
          <View style={dynamicStyles.versionBadge}>
            <Text style={dynamicStyles.versionText}>GreenPay ZISWAF v1.0.0</Text>
          </View>
          <Text style={dynamicStyles.footerText}>{t('settings.footer')}</Text>
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 250,
  },
  
  container: { padding: Spacing.xl },
  
  pageHeader: { marginBottom: Spacing['2xl'] },
  pageTitle: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 14, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },

  card: { 
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius['xl'], 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border, 
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    shadowOpacity: isDark ? 0.2 : 0.05,
  },
  optionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: Spacing.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, // Squircle look
    alignItems: 'center', 
    justifyContent: 'center',
    ...Shadows.sm,
  },
  optionTitle: { fontSize: 16, color: colors.text, fontWeight: '700', letterSpacing: -0.2 },
  optionRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  optionValue: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  
  footerContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  versionBadge: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[200],
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  footerText: { 
    textAlign: 'center', 
    color: colors.textMuted, 
    fontSize: 12, 
    lineHeight: 20,
    opacity: 0.7,
  },
});
