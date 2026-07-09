import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../theme/spacing';

export default function Map({ colors }) {
  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="map" size={48} color={colors.textMuted} />
      <Text style={{ color: colors.textMuted, marginTop: Spacing.sm }}>Peta tidak didukung di Web.</Text>
      <Text style={{ color: colors.textMuted }}>Klik untuk buka di Google Maps.</Text>
    </View>
  );
}
