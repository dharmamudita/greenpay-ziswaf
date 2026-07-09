import React, { useEffect, useState, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import socket from '../../services/socket';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function GlobalToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    socket.on('GLOBAL_IMPACT_UPDATED', (data) => {
      // Show toast when global impact updates (e.g. someone donated)
      showToast(`🌍 Seseorang baru saja ${data.type === 'DONATION' ? 'berdonasi' : 'menyetor sampah'}!`);
    });

    return () => {
      socket.off('GLOBAL_IMPACT_UPDATED');
    };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true })
      ]).start(() => setToastMessage(null));
    }, 3000);
  };

  if (!toastMessage) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.toast}>
        <Ionicons name="notifications" size={20} color={Colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.text}>{toastMessage}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green[600],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  }
});
