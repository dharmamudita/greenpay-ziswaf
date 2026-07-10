import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { uploadToCloudinary } from '../utils/cloudinary';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function AiScannerScreen() {
  const { colors, isDark } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  const pickImage = async (useCamera = false) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.granted === false) {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin untuk mengakses kamera atau galeri.');
        return;
      }

      let pickerResult;
      if (useCamera) {
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        setImageUri(pickerResult.assets[0].uri);
        setResult(null); // Reset hasil sebelumnya
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal membuka pemilih gambar.');
    }
  };

  const analyzeWaste = async () => {
    if (!imageUri) {
      Alert.alert('Gambar Kosong', 'Pilih atau ambil foto sampah terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload ke Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(imageUri);
      
      // 2. Kirim URL ke Backend AI
      const response = await api.post('/ai/scan-waste', { imageUrl: cloudinaryUrl });
      
      if (response.data.error) {
        Alert.alert('Gagal Dianalisis', response.data.error);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error('AI Scan error:', error);
      Alert.alert('Error AI', error.response?.data?.error || 'Koneksi ke AI gagal. Pastikan API Key di backend sudah diatur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={dynamicStyles.screen} contentContainerStyle={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>{t('ai_scanner.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={dynamicStyles.subtitle}>
        {t('ai_scanner.subtitle')}<Text style={{ color: Colors.green[500], fontWeight: 'bold' }}>{t('ai_scanner.subtitle_highlight')}</Text>{t('ai_scanner.subtitle2')}
      </Text>

      <View style={dynamicStyles.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={dynamicStyles.previewImage} />
        ) : (
          <View style={dynamicStyles.placeholderBox}>
            <Ionicons name="scan-outline" size={80} color={colors.textMuted} />
            <Text style={dynamicStyles.placeholderText}>{t('ai_scanner.no_image')}</Text>
          </View>
        )}
      </View>

      <View style={dynamicStyles.actionRow}>
        <TouchableOpacity style={dynamicStyles.actionBtn} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={24} color={Colors.white} />
          <Text style={dynamicStyles.actionBtnText}>{t('ai_scanner.camera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[dynamicStyles.actionBtn, { backgroundColor: isDark ? colors.surface2 : Colors.gray[200] }]} onPress={() => pickImage(false)}>
          <Ionicons name="images" size={24} color={isDark ? Colors.white : Colors.black} />
          <Text style={[dynamicStyles.actionBtnText, { color: isDark ? Colors.white : Colors.black }]}>{t('ai_scanner.gallery')}</Text>
        </TouchableOpacity>
      </View>

      {imageUri && !result && (
        <Button 
          title={loading ? t('ai_scanner.scanning') : t('ai_scanner.scan_btn')} 
          onPress={analyzeWaste} 
          loading={loading}
          style={{ marginTop: Spacing.xl }}
        />
      )}

      {/* Hasil Analisis */}
      {result && (
        <View style={[dynamicStyles.resultCard, Shadows.md]}>
          <LinearGradient colors={[Colors.green[600], Colors.green[700]]} style={dynamicStyles.resultHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
            <Text style={dynamicStyles.resultTitle}>{t('ai_scanner.result_title')}</Text>
          </LinearGradient>
          
          <View style={dynamicStyles.resultContent}>
            <View style={dynamicStyles.resultItem}>
              <Text style={dynamicStyles.resultLabel}>{t('ai_scanner.detected')}</Text>
              <Text style={dynamicStyles.resultValue}>{result.detected_items}</Text>
            </View>
            <View style={dynamicStyles.resultItem}>
              <Text style={dynamicStyles.resultLabel}>{t('ai_scanner.category')}</Text>
              <Badge text={result.waste_category} variant="green" />
            </View>
            <View style={dynamicStyles.resultRow}>
              <View style={dynamicStyles.resultCol}>
                <Text style={dynamicStyles.resultLabel}>{t('ai_scanner.weight')}</Text>
                <Text style={[dynamicStyles.resultValue, { fontSize: 20 }]}>{result.estimated_weight_kg} Kg</Text>
              </View>
              <View style={dynamicStyles.resultCol}>
                <Text style={dynamicStyles.resultLabel}>{t('ai_scanner.points')}</Text>
                <Text style={[dynamicStyles.resultValue, { fontSize: 20, color: Colors.gold[500] }]}>+{result.estimated_points} GP</Text>
              </View>
            </View>
            <View style={dynamicStyles.funFactBox}>
              <Ionicons name="bulb" size={24} color={Colors.gold[400]} />
              <Text style={dynamicStyles.funFactText}>{result.fun_fact}</Text>
            </View>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl, paddingTop: Spacing['3xl'], paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  backBtn: { padding: Spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.xl },
  
  imageBox: { width: '100%', height: width * 0.8, backgroundColor: isDark ? colors.surface : Colors.gray[100], borderRadius: BorderRadius['2xl'], overflow: 'hidden', borderWidth: 2, borderColor: isDark ? colors.border : Colors.gray[200], borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%' },
  placeholderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  placeholderText: { marginTop: Spacing.md, color: colors.textMuted, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1, backgroundColor: Colors.green[600], padding: Spacing.lg, borderRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  
  resultCard: { backgroundColor: colors.surface, borderRadius: BorderRadius['2xl'], overflow: 'hidden', marginTop: Spacing.xl, borderWidth: isDark ? 1 : 0, borderColor: colors.border },
  resultHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm, justifyContent: 'center' },
  resultTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  resultContent: { padding: Spacing.xl, gap: Spacing.lg },
  resultItem: { gap: 4 },
  resultLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  resultValue: { fontSize: 18, color: colors.text, fontWeight: '800' },
  resultRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: Spacing.lg },
  resultCol: { flex: 1 },
  funFactBox: { backgroundColor: isDark ? 'rgba(250,204,21,0.1)' : Colors.gold[50], padding: Spacing.md, borderRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.sm, borderWidth: 1, borderColor: isDark ? 'rgba(250,204,21,0.3)' : Colors.gold[200] },
  funFactText: { flex: 1, color: isDark ? Colors.gold[300] : Colors.gold[700], fontSize: 13, lineHeight: 20, fontWeight: '500' }
});
