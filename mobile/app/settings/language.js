import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function LanguageSettingScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const dynamicStyles = getStyles(colors, isDark);

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          {[
            { id: 'id', label: t('settings.lang_id'), icon: 'language-outline' },
            { id: 'en', label: t('settings.lang_en'), icon: 'language-outline' },
          ].map((lang, index) => (
            <TouchableOpacity 
              key={lang.id} 
              style={[
                dynamicStyles.optionRow, 
                i18n.language === lang.id && dynamicStyles.optionActive,
                index === 1 && { borderBottomWidth: 0 }
              ]} 
              onPress={() => changeLanguage(lang.id)}
            >
              <View style={dynamicStyles.optionLeft}>
                <Ionicons name={lang.icon} size={22} color={i18n.language === lang.id ? Colors.green[500] : colors.textMuted} />
                <Text style={[dynamicStyles.optionText, i18n.language === lang.id && { color: Colors.green[500], fontWeight: '700' }]}>{lang.label}</Text>
              </View>
              {i18n.language === lang.id && <Ionicons name="checkmark-circle" size={24} color={Colors.green[500]} />}
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
  card: { backgroundColor: colors.surface, borderRadius: BorderRadius['2xl'], borderWidth: isDark ? 1 : 0, borderColor: colors.border, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: isDark ? colors.border : 'rgba(0,0,0,0.05)' },
  optionActive: { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  optionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
});
