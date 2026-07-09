import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { themeMode, changeTheme, colors, isDark } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const dynamicStyles = getStyles(colors, isDark);

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        
        {/* Theme Settings */}
        <Text style={dynamicStyles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={dynamicStyles.card}>
          {[
            { id: 'system', label: t('settings.theme_system'), icon: 'phone-portrait-outline' },
            { id: 'light', label: t('settings.theme_light'), icon: 'sunny-outline' },
            { id: 'dark', label: t('settings.theme_dark'), icon: 'moon-outline' },
          ].map((theme) => (
            <TouchableOpacity 
              key={theme.id} 
              style={[dynamicStyles.optionRow, themeMode === theme.id && dynamicStyles.optionActive]} 
              onPress={() => changeTheme(theme.id)}
            >
              <View style={dynamicStyles.optionLeft}>
                <Ionicons name={theme.icon} size={20} color={themeMode === theme.id ? Colors.green[500] : colors.textMuted} />
                <Text style={[dynamicStyles.optionText, themeMode === theme.id && { color: Colors.green[500], fontWeight: '700' }]}>{theme.label}</Text>
              </View>
              {themeMode === theme.id && <Ionicons name="checkmark-circle" size={20} color={Colors.green[500]} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Settings */}
        <Text style={[dynamicStyles.sectionTitle, { marginTop: Spacing.xl }]}>{t('settings.language')}</Text>
        <View style={dynamicStyles.card}>
          {[
            { id: 'id', label: t('settings.lang_id'), icon: 'language-outline' },
            { id: 'en', label: t('settings.lang_en'), icon: 'language-outline' },
          ].map((lang) => (
            <TouchableOpacity 
              key={lang.id} 
              style={[dynamicStyles.optionRow, i18n.language === lang.id && dynamicStyles.optionActive]} 
              onPress={() => changeLanguage(lang.id)}
            >
              <View style={dynamicStyles.optionLeft}>
                <Ionicons name={lang.icon} size={20} color={i18n.language === lang.id ? Colors.green[500] : colors.textMuted} />
                <Text style={[dynamicStyles.optionText, i18n.language === lang.id && { color: Colors.green[500], fontWeight: '700' }]}>{lang.label}</Text>
              </View>
              {i18n.language === lang.id && <Ionicons name="checkmark-circle" size={20} color={Colors.green[500]} />}
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: isDark ? Colors.white : Colors.black, marginBottom: Spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  optionText: { fontSize: 14, color: isDark ? Colors.gray[300] : Colors.gray[700], fontWeight: '500' },
});
