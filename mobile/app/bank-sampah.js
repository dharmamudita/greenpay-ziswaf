import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Image, Alert, Modal, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui';
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
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingLocs, setLoadingLocs] = useState(true);
  const [showLocModal, setShowLocModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoadingLocs(true);
      const res = await api.get('/waste/locations');
      setLocations(res.data);
      if (res.data && res.data.length > 0) {
        setSelectedLocation(res.data[0]);
      }
    } catch (error) {
      console.log('Error fetching locations:', error);
    } finally {
      setLoadingLocs(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocations();
  }, []);

  const typeDetails = wasteTypes.find(t => t.id === selectedType);
  const estimatedPoints = weight ? parseFloat(weight) * typeDetails.points : 0;

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lat = selectedLocation?.latitude || -5.3687;
  const lng = selectedLocation?.longitude || 105.2393;

  const openGoogleMaps = () => {
    if (!selectedLocation) return;
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
      const rawUrl = await uploadToCloudinary(photoUri);
      const watermarkedUrl = getWatermarkedUrl(rawUrl);

      await api.post('/waste/deposit', {
        location_id: selectedLocation.id,
        waste_type: selectedType,
        weight_kg: parseFloat(weight),
        photo_url: watermarkedUrl,
        notes: 'Diunggah via aplikasi',
      });

      Alert.alert('Berhasil!', `Setoran sampah berhasil diajukan dan sedang menunggu verifikasi.`, [
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
    <ScrollView 
      style={dynamicStyles.screen} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />}
    >
      
      {/* Soft Background Gradient */}
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50], colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        
        {/* Premium Location Selector */}
        <View style={dynamicStyles.locationSelectorWrapper}>
          <Text style={dynamicStyles.sectionLabel}>{t('bank_sampah.location', {defaultValue: 'Lokasi Setoran'})}</Text>
          <TouchableOpacity 
            style={dynamicStyles.premiumSelector} 
            activeOpacity={0.8}
            onPress={() => setShowLocModal(true)}
          >
            <View style={dynamicStyles.premiumSelectorIcon}>
              <Ionicons name="business" size={22} color={Colors.white} />
            </View>
            <View style={dynamicStyles.premiumSelectorTextWrap}>
              <Text style={dynamicStyles.premiumSelectorTitle}>
                {loadingLocs ? 'Loading...' : (selectedLocation?.name || t('bank_sampah.title', { defaultValue: 'Pilih Bank Sampah' }))}
              </Text>
              <Text style={dynamicStyles.premiumSelectorAddress} numberOfLines={1}>
                {selectedLocation?.address || t('bank_sampah.search', { defaultValue: 'Ketuk untuk memilih lokasi' })}
              </Text>
            </View>
            <View style={dynamicStyles.premiumSelectorChevron}>
              <Ionicons name="chevron-down" size={20} color={Colors.green[600]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Smart GPS Location Card */}
        <View style={dynamicStyles.mapWrapper}>
          <View style={dynamicStyles.mapCard}>
            <TouchableOpacity activeOpacity={0.9} onPress={openGoogleMaps} style={dynamicStyles.mapTouchArea}>
              <Map lat={lat} lng={lng} openGoogleMaps={openGoogleMaps} colors={colors} />
              
              <View style={dynamicStyles.mapOverlayHint}>
                <Text style={dynamicStyles.mapOverlayText}>{t('bank_sampah.open_maps', { defaultValue: 'Buka di Maps' })}</Text>
                <Ionicons name="open-outline" size={12} color={Colors.white} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Magical AI Scanner Banner */}
        <TouchableOpacity 
          style={dynamicStyles.aiBannerWrap} 
          activeOpacity={0.9}
          onPress={() => router.push('/ai-scanner')}
        >
          {/* Ambient Glow */}
          <View style={dynamicStyles.aiBannerGlow} />
          
          <LinearGradient 
            colors={[Colors.green[600], Colors.green[800]]} 
            style={dynamicStyles.aiBannerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Sci-Fi Background Pattern */}
            <Ionicons name="planet" size={120} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', right: -20, top: -20 }} />
            
            <View style={dynamicStyles.aiIconWrap}>
              <Ionicons name="scan" size={24} color={Colors.green[700]} />
              <View style={dynamicStyles.aiSparkle}>
                <Ionicons name="sparkles" size={14} color={Colors.gold[400]} />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={dynamicStyles.aiBannerTitle}>{t('bank_sampah.ai_scanner', { defaultValue: 'AI Waste Scanner ✨' })}</Text>
              <Text style={dynamicStyles.aiBannerDesc}>{t('bank_sampah.ai_scanner_desc', { defaultValue: 'Pindai sampah Anda dengan AI untuk mengetahui nilainya!' })}</Text>
            </View>
            <View style={dynamicStyles.aiArrowBtn}>
              <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={dynamicStyles.sectionTitle}>{t('bank_sampah.manual_deposit', {defaultValue: 'Setoran Manual'})}</Text>
        
        {/* Interactive Form */}
        <View style={dynamicStyles.formContainer}>
          
          {/* Waste Types Grid */}
          <Text style={dynamicStyles.label}>{t('bank_sampah.waste_category', {defaultValue: 'Kategori Sampah'})}</Text>
          <View style={dynamicStyles.typeGrid}>
            {wasteTypes.map((type) => {
              const isActive = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    dynamicStyles.typeBtn, 
                    isActive && dynamicStyles.typeBtnActive,
                    isActive && { borderColor: type.color, shadowColor: type.color }
                  ]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.7}
                >
                  <View style={[dynamicStyles.typeIconBg, isActive && { backgroundColor: type.color + '20' }]}>
                    <Ionicons name={type.icon} size={28} color={isActive ? type.color : colors.textMuted} />
                  </View>
                  <Text style={[dynamicStyles.typeText, isActive && { color: colors.text, fontWeight: '800' }]}>{type.name}</Text>
                  <Text style={[dynamicStyles.typePoints, isActive && { color: type.color, fontWeight: '700' }]}>{type.points} GP/kg</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Weight Input */}
          <Text style={[dynamicStyles.label, { marginTop: Spacing.xl }]}>Berat Estimasi (Kg)</Text>
          <View style={[dynamicStyles.inputWrap, isDark && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
            <View style={dynamicStyles.inputIcon}>
              <Ionicons name="scale-outline" size={20} color={colors.textMuted} />
            </View>
            <TextInput
              style={dynamicStyles.input}
              placeholder="0.0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
            <View style={dynamicStyles.inputUnitTag}>
              <Text style={dynamicStyles.inputUnitText}>Kg</Text>
            </View>
          </View>

          {/* Photo Upload */}
          <Text style={[dynamicStyles.label, { marginTop: Spacing.xl }]}>Foto Bukti (Wajib)</Text>
          <TouchableOpacity style={dynamicStyles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <View style={dynamicStyles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={dynamicStyles.photoPreview} />
                <View style={dynamicStyles.photoRetakeBtn}>
                  <Ionicons name="camera-reverse" size={20} color={Colors.white} />
                  <Text style={dynamicStyles.photoRetakeText}>{t('bank_sampah.retake_photo', {defaultValue: 'Ganti Foto'})}</Text>
                </View>
              </View>
            ) : (
              <View style={dynamicStyles.photoPlaceholder}>
                <View style={dynamicStyles.photoIconCircle}>
                  <Ionicons name="camera" size={32} color={Colors.green[500]} />
                </View>
                <Text style={dynamicStyles.photoHint}>{t('bank_sampah.tap_to_capture', {defaultValue: 'Ketuk untuk potret sampah'})}</Text>
                <Text style={dynamicStyles.photoHintSmall}>Sistem akan mencatat lokasi & waktu</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Digital Receipt (Estimate) */}
          <View style={dynamicStyles.receiptBox}>
            <View style={dynamicStyles.receiptHeader}>
              <Ionicons name="receipt-outline" size={16} color={Colors.green[600]} />
              <Text style={dynamicStyles.receiptTitle}>{t('bank_sampah.est_revenue', {defaultValue: 'ESTIMASI PENDAPATAN'})}</Text>
            </View>
            <View style={dynamicStyles.receiptDivider} />
            <View style={dynamicStyles.receiptRow}>
              <Text style={dynamicStyles.receiptLabel}>{typeDetails.name} ({weight || '0'} kg x {typeDetails.points} GP)</Text>
              <Text style={dynamicStyles.receiptValue}>+{Math.floor(estimatedPoints)} <Text style={dynamicStyles.receiptUnit}>GP</Text></Text>
            </View>
          </View>

          <Button 
            title={photoUri ? "Kirim Setoran Sekarang" : "Lengkapi Bukti Foto"} 
            icon={<Ionicons name={photoUri ? "paper-plane" : "camera"} size={18} color={isDark ? Colors.white : Colors.black} />} 
            onPress={handleSubmit} 
            loading={loading}
            disabled={!photoUri || !weight}
            style={{ marginTop: Spacing.xl }}
          />
        </View>

      </View>
      <View style={{ height: Spacing['3xl'] }} />

      {/* Location Selection Modal (Premium Bottom Sheet) */}
      <Modal
        visible={showLocModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            activeOpacity={1} 
            onPress={() => setShowLocModal(false)} 
          />
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalGrabberWrap}>
              <View style={dynamicStyles.modalGrabber} />
            </View>
            <View style={dynamicStyles.modalHeader}>
              <View>
                <Text style={dynamicStyles.modalTitle}>{t('bank_sampah.select_district', {defaultValue: 'Pilih Distrik'})}</Text>
                <Text style={dynamicStyles.modalSubtitle}>{t('bank_sampah.district_subtitle', {defaultValue: 'Tempat penyaluran setoran sampah Anda'})}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLocModal(false)} style={dynamicStyles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[dynamicStyles.searchWrap, isDark && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={dynamicStyles.searchInput}
                placeholder="Cari nama distrik atau alamat..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {filteredLocations.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="search-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
                  <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>
                    {loadingLocs ? 'Memuat lokasi...' : 'Pencarian tidak ditemukan.'}
                  </Text>
                </View>
              )}
              {filteredLocations.map((loc, index) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[
                      dynamicStyles.locItem,
                      isSelected && dynamicStyles.locItemActive,
                      index === filteredLocations.length - 1 && { marginBottom: 40 }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocModal(false);
                    }}
                  >
                    <View style={[dynamicStyles.locIconWrapModal, isSelected && { backgroundColor: Colors.green[500] }]}>
                      <Ionicons name="business" size={22} color={isSelected ? Colors.white : Colors.green[600]} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 16 }}>
                      <Text style={[dynamicStyles.locItemName, isSelected && { color: Colors.green[700] }]}>
                        {loc.name}
                      </Text>
                      <Text style={dynamicStyles.locItemAddress} numberOfLines={2}>
                        {loc.address}
                      </Text>
                    </View>
                    <View style={[dynamicStyles.radioCircle, isSelected && dynamicStyles.radioCircleSelected]}>
                      {isSelected && <View style={dynamicStyles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 300,
  },
  container: { padding: Spacing.xl },
  
  // Premium Location Selector
  locationSelectorWrapper: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  premiumSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
    ...Shadows.sm,
  },
  premiumSelectorIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.md,
    shadowColor: Colors.green[500],
  },
  premiumSelectorTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumSelectorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  premiumSelectorAddress: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  premiumSelectorChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },

  // Smart Location Card
  mapWrapper: {
    marginBottom: Spacing['2xl'],
    ...Shadows.lg,
    shadowOpacity: isDark ? 0.3 : 0.1,
  },
  mapCard: { 
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
  },
  mapTouchArea: { width: '100%', height: 180, position: 'relative' },
  
  // Magical AI Banner
  aiBannerWrap: {
    position: 'relative',
    marginBottom: Spacing['2xl'],
  },
  aiBannerGlow: {
    position: 'absolute',
    top: 10, left: 10, right: 10, bottom: -5,
    backgroundColor: Colors.green[500],
    borderRadius: BorderRadius['2xl'],
    opacity: isDark ? 0.4 : 0.5,
    filter: 'blur(20px)', // Web support
  },
  aiBannerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  aiIconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: Colors.white, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...Shadows.md,
  },
  aiSparkle: { position: 'absolute', top: -4, right: -4 },
  aiBannerTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', marginBottom: 2, letterSpacing: -0.5 },
  aiBannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  aiArrowBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  
  formContainer: {
    backgroundColor: colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
    ...Shadows.sm,
  },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  
  // Waste Types (Glowing active state)
  typeGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  typeBtn: { 
    width: '31%', 
    aspectRatio: 0.95, 
    backgroundColor: colors.bg, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: Spacing.sm,
  },
  typeBtnActive: { 
    backgroundColor: colors.surface,
    borderWidth: 2,
    ...Shadows.md, // Glow is simulated via shadowColor assigned inline
    shadowOpacity: isDark ? 0.6 : 0.3,
    shadowRadius: 8,
  },
  typeIconBg: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  typeText: { fontSize: 11, fontWeight: '600', color: colors.textMuted, marginBottom: 2 },
  typePoints: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  
  // Premium Input
  inputWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.bg, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: Spacing.md,
  },
  input: { 
    flex: 1, 
    color: colors.text, 
    fontSize: 20, 
    fontWeight: '800',
    paddingVertical: Spacing.md,
  },
  inputUnitTag: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  inputUnitText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  
  // Photo Upload
  photoBox: { 
    backgroundColor: colors.bg, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1.5, 
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, 
    borderStyle: 'dashed',
    height: 180, 
    overflow: 'hidden',
  },
  photoPlaceholder: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
  },
  photoIconCircle: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoHint: { color: colors.text, fontSize: 15, fontWeight: '700' },
  photoHintSmall: { color: colors.textMuted, fontSize: 11, fontWeight: '500' },
  photoPreviewWrap: { flex: 1, position: 'relative' },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoRetakeBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  photoRetakeText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  
  // Glassmorphism Receipt
  receiptBox: { 
    marginTop: Spacing['2xl'],
    backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  receiptTitle: {
    color: Colors.green[600],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  receiptDivider: {
    height: 1,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.green[500],
    borderStyle: 'dashed',
    opacity: 0.3,
    marginBottom: Spacing.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
  receiptValue: { color: Colors.green[600], fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  receiptUnit: { fontSize: 14, fontWeight: '800' },

  // Modal Styles (Premium Bottom Sheet)
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    ...Shadows.lg,
    shadowOpacity: 0.2,
  },
  modalGrabberWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  modalGrabber: {
    width: 40,
    height: 5,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : Colors.gray[300],
    borderRadius: 3,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: Spacing.xl 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  locItem: {  
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.xl, 
    marginBottom: Spacing.md,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  locItemActive: {
    backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : Colors.green[50],
    borderColor: Colors.green[400],
  },
  locIconWrapModal: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[200],
  },
  locItemName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  locItemAddress: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.green[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green[500],
  }
});
