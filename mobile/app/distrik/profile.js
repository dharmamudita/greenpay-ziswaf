import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import Map from '../../components/Map';

// Map feature disabled temporarily for Web compatibility

export default function DistrikProfileScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    operating_hours: '',
    latitude: -5.3687, // Default to Bandar Lampung
    longitude: 105.2393,
  });

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/distrik/profile');
      if (res.data) {
        setFormData({
          name: res.data.name || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          operating_hours: res.data.operating_hours || '',
          latitude: parseFloat(res.data.latitude) || -5.3687,
          longitude: parseFloat(res.data.longitude) || 105.2393,
        });
      }
    } catch (error) {
      console.log('No profile found or error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      return Alert.alert('Error', 'Nama, alamat, dan nomor telepon wajib diisi.');
    }
    setSaving(true);
    try {
      await api.put('/distrik/profile', formData);
      Alert.alert('Sukses', 'Profil Bank Sampah berhasil diperbarui!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleGetLocation = () => {
    Alert.alert('Info', 'Fitur GPS otomatis sedang dinonaktifkan. Silakan geser PIN pada peta secara manual.');
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      <View style={dynamicStyles.container}>


        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Nama Bank Sampah *</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.name}
            onChangeText={(v) => setFormData({...formData, name: v})}
            placeholder="Misal: Bank Sampah Hijau Lestari"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Nomor Telepon *</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.phone}
            onChangeText={(v) => setFormData({...formData, phone: v})}
            placeholder="Misal: 08123456789"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>{t('distrik.operational_hours', {defaultValue: 'Jam Operasional'})}</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.operating_hours}
            onChangeText={(v) => setFormData({...formData, operating_hours: v})}
            placeholder="Misal: Senin-Sabtu 08:00 - 16:00"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Alamat Lengkap *</Text>
          <TextInput
            style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.address}
            onChangeText={(v) => setFormData({...formData, address: v})}
            placeholder="Alamat lengkap distrik..."
            multiline
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={dynamicStyles.formGroup}>
          <Text style={dynamicStyles.label}>Koordinat Peta (GPS) *</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: Spacing.sm }}>
            {t('distrik.map_hint', {defaultValue: 'Pastikan titik lokasi di bawah ini akurat agar pengguna tidak tersasar.'})}
          </Text>
          
          <View style={dynamicStyles.mapContainer}>
            {Platform.OS !== 'web' ? (
              <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
                <Map 
                  lat={formData.latitude} 
                  lng={formData.longitude} 
                  onMapPress={(coord) => setFormData({...formData, latitude: coord.latitude, longitude: coord.longitude})} 
                />
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="map" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>{t('distrik.map_disabled', {defaultValue: 'Peta dinonaktifkan sementara.'})}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t('distrik.map_manual', {defaultValue: 'Isi koordinat secara manual di bawah.'})}</Text>
              </View>
            )}
            <View style={dynamicStyles.mapOverlayHint}>
              <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '700' }}>{t('distrik.map_tap', {defaultValue: 'Ketuk Peta untuk Pindah Titik'})}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginBottom: 4 }}>{t('distrik.latitude', {defaultValue: 'Latitude'})}</Text>
              <TextInput 
                style={dynamicStyles.inputSmall} 
                value={formData.latitude.toString()} 
                onChangeText={(v) => setFormData({...formData, latitude: parseFloat(v) || 0})}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginBottom: 4 }}>{t('distrik.longitude', {defaultValue: 'Longitude'})}</Text>
              <TextInput 
                style={dynamicStyles.inputSmall} 
                value={formData.longitude.toString()} 
                onChangeText={(v) => setFormData({...formData, longitude: parseFloat(v) || 0})}
              />
            </View>
          </View>

          <TouchableOpacity style={dynamicStyles.gpsBtn} onPress={handleGetLocation}>
            <Ionicons name="locate" size={16} color={Colors.white} />
            <Text style={dynamicStyles.gpsBtnText}>{t('distrik.use_gps', {defaultValue: 'Gunakan GPS Saat Ini'})}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[dynamicStyles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={[Colors.green[500], Colors.green[600]]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.saveBtnText}>{t('distrik.save_profile', {defaultValue: 'Simpan Profil'})}</Text>}
        </TouchableOpacity>

      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: Spacing['2xl'] },
  
  formGroup: { marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  inputSmall: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    fontSize: 12,
    color: colors.text,
  },
  
  mapContainer: {
    height: 250,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  mapOverlayHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    gap: 8,
  },
  gpsBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  
  saveBtn: {
    borderRadius: BorderRadius.xl,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
