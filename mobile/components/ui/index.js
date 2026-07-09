import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';
import { BorderRadius, Spacing, Shadows } from '../../theme/spacing';
import { useTheme } from '../../context/ThemeContext';

export function Button({ title, onPress, variant = 'primary', loading = false, style, textStyle, icon }) {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const renderContent = (btnColors, btnStyles, textColor) => (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading} 
        style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
      >
        {btnColors ? (
          <LinearGradient
            colors={btnColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[btnStyles, Shadows.sm]}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> : <>{icon}<Text style={[dynamicStyles.primaryText, textColor && { color: textColor }, textStyle]}>{title}</Text></>}
          </LinearGradient>
        ) : (
          <Animated.View style={[btnStyles, Shadows.sm]}>
             {loading ? <ActivityIndicator color={textColor || colors.text} /> : <>{icon}<Text style={[dynamicStyles.secondaryText, textColor && { color: textColor }, textStyle]}>{title}</Text></>}
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );

  if (variant === 'primary') {
    return renderContent([Colors.green[600], Colors.green[500]], dynamicStyles.primaryBtn);
  }

  if (variant === 'gold') {
    return renderContent([Colors.gold[500], Colors.gold[400]], dynamicStyles.primaryBtn, isDark ? Colors.dark.bg : Colors.light.bg);
  }

  if (variant === 'outline') {
    return renderContent(null, [dynamicStyles.outlineBtn, { shadowOpacity: 0, elevation: 0 }], Colors.green[600]);
  }

  return renderContent(null, [dynamicStyles.secondaryBtn, { shadowOpacity: 0, elevation: 0 }]);
}

export function Card({ children, style, onPress, ...props }) {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [dynamicStyles.card, Shadows.sm, style, pressed && onPress && { opacity: 0.9, transform: [{ scale: 0.98 }] }]} {...props}>
      {children}
    </Pressable>
  );
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
    borderRadius: BorderRadius.xl,
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
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.green[600],
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: Colors.green[600],
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    backgroundColor: colors.surface2,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.border : 'transparent',
    padding: Spacing.base,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
