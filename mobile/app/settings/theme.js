import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function ThemeSettingScreen() {
  const { t } = useTranslation();
  const { themeMode, changeTheme, colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          {[
            { id: 'system', label: t('settings.theme_system'), icon: 'phone-portrait-outline' },
            { id: 'light', label: t('settings.theme_light'), icon: 'sunny-outline' },
            { id: 'dark', label: t('settings.theme_dark'), icon: 'moon-outline' },
          ].map((theme, index) => (
            <TouchableOpacity 
              key={theme.id} 
              style={[
                dynamicStyles.optionRow, 
                themeMode === theme.id && dynamicStyles.optionActive,
                index === 2 && { borderBottomWidth: 0 }
              ]} 
              onPress={() => changeTheme(theme.id)}
            >
              <View style={dynamicStyles.optionLeft}>
                <Ionicons name={theme.icon} size={22} color={themeMode === theme.id ? Colors.green[500] : colors.textMuted} />
                <Text style={[dynamicStyles.optionText, themeMode === theme.id && { color: Colors.green[500], fontWeight: '700' }]}>{theme.label}</Text>
              </View>
              {themeMode === theme.id && <Ionicons name="checkmark-circle" size={24} color={Colors.green[500]} />}
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
