import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';

export function Button({ title, onPress, variant = 'primary', loading = false, style, textStyle, icon }) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[Colors.green[600], Colors.green[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
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
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, { color: Colors.dark.bg }, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.7} style={[styles.outlineBtn, style]}>
        {loading ? (
          <ActivityIndicator color={Colors.green[400]} />
        ) : (
          <>
            {icon}
            <Text style={[styles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.7} style={[styles.secondaryBtn, style]}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <TouchableOpacity activeOpacity={1} style={[styles.card, style]}>{children}</TouchableOpacity>;
}

export function Badge({ text, variant = 'green', style }) {
  const bgMap = { green: Colors.green[900], gold: Colors.gold[600] + '20', info: Colors.info + '20' };
  const colorMap = { green: Colors.green[400], gold: Colors.gold[400], info: Colors.info };
  return (
    <Text style={[styles.badge, { backgroundColor: bgMap[variant], color: colorMap[variant] }, style]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.green[400],
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
    backgroundColor: Colors.dark.surface2,
  },
  secondaryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
