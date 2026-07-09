import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, Button } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import Map from '../components/Map';

const wasteTypes = [
  { id: 'plastik', name: 'Plastik', icon: 'water', points: 10, color: Colors.info },
  { id: 'kertas', name: 'Kertas', icon: 'document-text', points: 8, color: Colors.gold[400] },
  { id: 'logam', name: 'Logam', icon: 'construct', points: 15, color: Colors.gray[400] },
  { id: 'kaca', name: 'Kaca', icon: 'wine', points: 5, color: Colors.pink },
  { id: 'elektronik', name: 'Elektronik', icon: 'hardware-chip', points: 25, color: Colors.purple },
  { id: 'organik', name: 'Organik', icon: 'leaf', points: 3, color: Colors.green[400] },
];

export default function BankSampahScreen() {
  const [selectedType, setSelectedType] = useState('plastik');
  const [weight, setWeight] = useState('');
  const { colors, isDark } = useTheme();
  
  const dynamicStyles = getStyles(colors, isDark);

  const typeDetails = wasteTypes.find(t => t.id === selectedType);
  const estimatedPoints = weight ? parseFloat(weight) * typeDetails.points : 0;

  const lat = -5.3687;
  const lng = 105.2393;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(err => console.error("Gagal membuka peta:", err));
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        {/* Map */}
        <Card style={dynamicStyles.mapCard}>
          <TouchableOpacity activeOpacity={0.9} onPress={openGoogleMaps} style={{ width: '100%', height: 180 }}>
            <Map lat={lat} lng={lng} openGoogleMaps={openGoogleMaps} colors={colors} />
            <View style={dynamicStyles.mapOverlayHint}>
              <Text style={dynamicStyles.mapOverlayText}>Buka di Google Maps</Text>
            </View>
          </TouchableOpacity>
          <View style={dynamicStyles.locationInfo}>
            <Text style={dynamicStyles.locName}>Bank Sampah Hijau Lestari</Text>
            <Text style={dynamicStyles.locAddress}>Jl. ZA Pagar Alam No. 45, Rajabasa, Bandar Lampung</Text>
            <Text style={dynamicStyles.locDistance}>📍 1.2 km dari lokasi Anda</Text>
          </View>
        </Card>

        {/* Setor Sampah Form */}
        <Text style={dynamicStyles.sectionTitle}>Formulir Setoran</Text>
        <Card style={dynamicStyles.formCard}>
          <Text style={dynamicStyles.label}>Pilih Jenis Sampah</Text>
          <View style={dynamicStyles.typeGrid}>
            {wasteTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  dynamicStyles.typeBtn, 
                  selectedType === type.id && dynamicStyles.typeBtnActive, 
                  { borderColor: selectedType === type.id ? type.color : colors.border }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons name={type.icon} size={24} color={selectedType === type.id ? type.color : colors.textMuted} />
                <Text style={[dynamicStyles.typeText, selectedType === type.id && { color: isDark ? Colors.white : type.color }]}>{type.name}</Text>
                <Text style={dynamicStyles.typePoints}>{type.points} GP/kg</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[dynamicStyles.label, { marginTop: Spacing.lg }]}>Berat (Kg)</Text>
          <View style={dynamicStyles.inputWrap}>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Contoh: 2.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <Text style={dynamicStyles.inputUnit}>Kg</Text>
          </View>

          <View style={dynamicStyles.estimateBox}>
            <Text style={dynamicStyles.estimateLabel}>Estimasi Green Point:</Text>
            <Text style={dynamicStyles.estimateValue}>+ {Math.floor(estimatedPoints)} GP</Text>
          </View>

          <Button title="Ajukan Setoran" icon={<Ionicons name="camera" size={18} color={isDark ? Colors.white : Colors.black} />} onPress={() => {}} />
        </Card>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl },
  mapOverlayHint: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  mapOverlayText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  locationInfo: { padding: Spacing.base },
  locName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  locAddress: { fontSize: 12, color: colors.textMuted, marginBottom: Spacing.xs },
  locDistance: { fontSize: 12, fontWeight: '600', color: Colors.green[500] },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  formCard: { gap: Spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: Spacing.xs },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { width: '31%', aspectRatio: 1, backgroundColor: colors.surface2, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  typeBtnActive: { backgroundColor: colors.surface },
  typeText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  typePoints: { fontSize: 10, color: colors.textMuted },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: Spacing.md },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: Spacing.md },
  inputUnit: { color: colors.textMuted, fontWeight: '600' },
  estimateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', padding: Spacing.md, borderRadius: BorderRadius.lg, marginVertical: Spacing.md },
  estimateLabel: { color: Colors.green[500], fontSize: 13 },
  estimateValue: { color: Colors.green[500], fontSize: 18, fontWeight: '800' },
});
