import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

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

  const typeDetails = wasteTypes.find(t => t.id === selectedType);
  const estimatedPoints = weight ? parseFloat(weight) * typeDetails.points : 0;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Map Placeholder */}
        <Card style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={Colors.gray[600]} />
            <Text style={styles.mapText}>Peta Lokasi Bank Sampah</Text>
            <Badge text="Google Maps API Required" variant="info" style={{ marginTop: Spacing.sm }} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locName}>Bank Sampah Hijau Lestari</Text>
            <Text style={styles.locAddress}>Jl. Merdeka No. 45, Jakarta Selatan</Text>
            <Text style={styles.locDistance}>📍 1.2 km dari lokasi Anda</Text>
          </View>
        </Card>

        {/* Setor Sampah Form */}
        <Text style={styles.sectionTitle}>Formulir Setoran</Text>
        <Card style={styles.formCard}>
          <Text style={styles.label}>Pilih Jenis Sampah</Text>
          <View style={styles.typeGrid}>
            {wasteTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeBtn, selectedType === type.id && styles.typeBtnActive, { borderColor: selectedType === type.id ? type.color : Colors.dark.border }]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons name={type.icon} size={24} color={selectedType === type.id ? type.color : Colors.gray[500]} />
                <Text style={[styles.typeText, selectedType === type.id && { color: Colors.white }]}>{type.name}</Text>
                <Text style={styles.typePoints}>{type.points} GP/kg</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Berat (Kg)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 2.5"
              placeholderTextColor={Colors.gray[600]}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <Text style={styles.inputUnit}>Kg</Text>
          </View>

          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Estimasi Green Point:</Text>
            <Text style={styles.estimateValue}>+ {Math.floor(estimatedPoints)} GP</Text>
          </View>

          <Button title="Ajukan Setoran" icon={<Ionicons name="camera" size={18} color={Colors.white} />} onPress={() => {}} />
        </Card>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl },
  mapPlaceholder: { height: 180, backgroundColor: Colors.dark.surface2, alignItems: 'center', justifyContent: 'center' },
  mapText: { color: Colors.gray[500], marginTop: Spacing.sm, fontWeight: '600' },
  locationInfo: { padding: Spacing.base },
  locName: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  locAddress: { fontSize: 12, color: Colors.gray[400], marginBottom: Spacing.xs },
  locDistance: { fontSize: 12, fontWeight: '600', color: Colors.green[400] },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  formCard: { gap: Spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: Colors.gray[300], marginBottom: Spacing.xs },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { width: '31%', aspectRatio: 1, backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  typeBtnActive: { backgroundColor: Colors.dark.surface },
  typeText: { fontSize: 11, fontWeight: '600', color: Colors.gray[400] },
  typePoints: { fontSize: 10, color: Colors.gray[500] },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.dark.border, paddingHorizontal: Spacing.md },
  input: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: Spacing.md },
  inputUnit: { color: Colors.gray[400], fontWeight: '600' },
  estimateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', padding: Spacing.md, borderRadius: BorderRadius.lg, marginVertical: Spacing.md },
  estimateLabel: { color: Colors.green[300], fontSize: 13 },
  estimateValue: { color: Colors.green[400], fontSize: 18, fontWeight: '800' },
});
