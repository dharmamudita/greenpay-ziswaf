import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { useTheme } from '../../context/ThemeContext';

export function Button({ title, onPress, variant = 'primary', loading = false, style, textStyle, icon }) {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[Colors.green[600], Colors.green[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={dynamicStyles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              {icon}
              <Text style={[dynamicStyles.primaryText, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'gold') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[Colors.gold[500], Colors.gold[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={dynamicStyles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              {icon}
              <Text style={[dynamicStyles.primaryText, { color: isDark ? Colors.dark.bg : Colors.light.bg }, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.7} style={[dynamicStyles.outlineBtn, style]}>
        {loading ? (
          <ActivityIndicator color={Colors.green[400]} />
        ) : (
          <>
            {icon}
            <Text style={[dynamicStyles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.7} style={[dynamicStyles.secondaryBtn, style]}>
      {loading ? (
        <ActivityIndicator color={isDark ? Colors.white : Colors.black} />
      ) : (
        <>
          {icon}
          <Text style={[dynamicStyles.secondaryText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  return <TouchableOpacity activeOpacity={1} style={[dynamicStyles.card, style]}>{children}</TouchableOpacity>;
}

export function Badge({ text, variant = 'green', style }) {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  const bgMap = { green: isDark ? Colors.green[900] : Colors.green[100], gold: isDark ? Colors.gold[600] + '20' : Colors.gold[100], info: isDark ? Colors.info + '20' : '#DBEAFE' };
  const colorMap = { green: isDark ? Colors.green[400] : Colors.green[700], gold: isDark ? Colors.gold[400] : Colors.gold[600], info: isDark ? Colors.info : '#1D4ED8' };
  return (
    <Text style={[dynamicStyles.badge, { backgroundColor: bgMap[variant], color: colorMap[variant] }, style]}>
      {text}
    </Text>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  primaryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.green[600],
  },
  outlineText: {
    color: Colors.green[500],
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.surface2,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.base,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
