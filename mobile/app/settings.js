import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { themeMode, colors, isDark } = useTheme();

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
      <View style={dynamicStyles.container}>
        
        {/* Akun */}
        <View style={[dynamicStyles.card, { marginBottom: Spacing.xl }]}>
          <TouchableOpacity 
            style={[dynamicStyles.optionRow, { borderBottomWidth: 0 }]} 
            onPress={() => router.push('/settings/account')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="person" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.optionTitle}>Pengaturan Akun</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>Ubah Data</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tampilan & Bahasa */}
        <View style={dynamicStyles.card}>
          <TouchableOpacity 
            style={dynamicStyles.optionRow} 
            onPress={() => router.push('/settings/theme')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="color-palette" size={20} color="#3B82F6" />
              </View>
              <Text style={dynamicStyles.optionTitle}>{t('settings.theme')}</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>{getThemeName()}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.optionRow, { borderBottomWidth: 0 }]} 
            onPress={() => router.push('/settings/language')}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.optionLeft}>
              <View style={[dynamicStyles.iconWrap, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)' }]}>
                <Ionicons name="language" size={20} color="#EAB308" />
              </View>
              <Text style={dynamicStyles.optionTitle}>{t('settings.language')}</Text>
            </View>
            <View style={dynamicStyles.optionRight}>
              <Text style={dynamicStyles.optionValue}>{getLanguageName()}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={dynamicStyles.footerText}>
          Pengaturan lanjutan untuk mempersonalisasi pengalaman Anda.
        </Text>

      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl, paddingTop: Spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.03)' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 16, color: colors.text, fontWeight: '700' },
  optionRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  optionValue: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  footerText: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: Spacing.xl, paddingHorizontal: Spacing.lg, lineHeight: 20 },
});
