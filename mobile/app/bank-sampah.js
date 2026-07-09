import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, Button } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import Map from '../components/Map';
import { uploadToCloudinary, getWatermarkedUrl } from '../utils/cloudinary';
import api from '../services/api';

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
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);

  const typeDetails = wasteTypes.find(t => t.id === selectedType);
  const estimatedPoints = weight ? parseFloat(weight) * typeDetails.points : 0;

  // Hardcoded location for demo
  const locationId = 1; 
  const lat = -5.3687;
  const lng = 105.2393;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(err => console.error("Gagal membuka peta:", err));
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Ditolak', 'Dibutuhkan akses kamera untuk mengambil bukti foto sampah.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!weight || isNaN(weight) || Number(weight) <= 0) {
      Alert.alert('Error', 'Silakan masukkan berat sampah yang valid.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Foto Diperlukan', 'Harap ambil foto bukti sampah terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload ke Cloudinary
      const rawUrl = await uploadToCloudinary(photoUri);
      
      // 2. Tambahkan watermark waktu secara dinamis
      const watermarkedUrl = getWatermarkedUrl(rawUrl);

      // 3. Simpan ke database via API
      await api.post('/waste/deposit', {
        location_id: locationId,
        waste_type: selectedType,
        weight_kg: parseFloat(weight),
        photo_url: watermarkedUrl,
        notes: 'Diunggah via aplikasi',
      });

      Alert.alert('Berhasil!', `Setoran sampah berhasil diajukan dan sedang menunggu verifikasi. Bukti foto Anda telah diberi watermark waktu untuk keamanan.`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
      
      setWeight('');
      setPhotoUri(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengunggah setoran.');
    } finally {
      setLoading(false);
    }
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

        {/* AI Scanner Banner */}
        <TouchableOpacity 
          style={[dynamicStyles.aiBanner, Shadows.sm]} 
          activeOpacity={0.9}
          onPress={() => router.push('/ai-scanner')}
        >
          <LinearGradient 
            colors={[Colors.green[500], Colors.green[700]]} 
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={dynamicStyles.aiBannerContent}>
            <View style={dynamicStyles.aiIconWrap}>
              <Ionicons name="scan" size={24} color={Colors.green[600]} />
              <View style={dynamicStyles.aiSparkle}>
                <Ionicons name="sparkles" size={12} color={Colors.gold[400]} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.aiBannerTitle}>AI Waste Scanner ✨</Text>
              <Text style={dynamicStyles.aiBannerDesc}>Foto sampahmu & prediksi poinnya secara instan!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* Setor Sampah Form */}
        <Text style={dynamicStyles.sectionTitle}>Formulir Setoran Manual</Text>
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

          <Text style={[dynamicStyles.label, { marginTop: Spacing.lg }]}>Bukti Foto (Wajib)</Text>
          <TouchableOpacity style={dynamicStyles.photoBox} onPress={handlePickPhoto} activeOpacity={0.7}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={dynamicStyles.photoPreview} />
            ) : (
              <View style={dynamicStyles.photoPlaceholder}>
                <Ionicons name="camera" size={32} color={colors.textMuted} />
                <Text style={dynamicStyles.photoHint}>Ketuk untuk mengambil foto</Text>
                <Text style={dynamicStyles.photoHintSmall}>Watermark waktu akan otomatis ditambahkan</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={dynamicStyles.estimateBox}>
            <Text style={dynamicStyles.estimateLabel}>Estimasi Green Point:</Text>
            <Text style={dynamicStyles.estimateValue}>+ {Math.floor(estimatedPoints)} GP</Text>
          </View>

          <Button 
            title={photoUri ? "Ajukan Setoran" : "Ambil Foto Dulu"} 
            icon={<Ionicons name="cloud-upload-outline" size={18} color={isDark ? Colors.white : Colors.black} />} 
            onPress={handleSubmit} 
            loading={loading}
            disabled={!photoUri}
          />
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
  
  aiBanner: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  aiBannerContent: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  aiIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  aiSparkle: { position: 'absolute', top: -2, right: -4 },
  aiBannerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  aiBannerDesc: { color: Colors.green[100], fontSize: 12, lineHeight: 16 },

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
  
  photoBox: { 
    backgroundColor: colors.surface2, 
    borderRadius: BorderRadius.lg, 
    borderWidth: 1.5, 
    borderColor: colors.border, 
    borderStyle: 'dashed',
    height: 180, 
    overflow: 'hidden',
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  photoPlaceholder: { alignItems: 'center', gap: 8 },
  photoHint: { color: colors.text, fontSize: 14, fontWeight: '600' },
  photoHintSmall: { color: colors.textMuted, fontSize: 11 },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  estimateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', padding: Spacing.md, borderRadius: BorderRadius.lg, marginVertical: Spacing.md },
  estimateLabel: { color: Colors.green[500], fontSize: 13 },
  estimateValue: { color: Colors.green[500], fontSize: 18, fontWeight: '800' },
});
