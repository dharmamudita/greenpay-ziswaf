import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

export default function TokoRewardManagerScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Voucher Verification
  const [voucherCode, setVoucherCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Modal states
  const [isModalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    points_cost: '',
    stock: '',
    image_url: '',
    category: 'Produk'
  });

  const fetchRewards = async () => {
    try {
      const res = await api.get('/distrik/toko/rewards');
      setRewards(res.data);
    } catch (error) {
      console.log('Error fetching rewards:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRewards();
  }, []);

  const handleVerifyVoucher = async () => {
    if (!voucherCode.trim()) return Alert.alert('Error', 'Masukkan kode voucher terlebih dahulu.');
    setVerifying(true);
    try {
      const res = await api.post('/distrik/rewards/verify', { voucher_code: voucherCode.trim() });
      Alert.alert('Sukses!', 'Voucher valid dan berhasil ditukarkan. Silakan berikan hadiah kepada pengguna.');
      setVoucherCode('');
    } catch (error) {
      Alert.alert('Gagal', error.response?.data?.error || 'Kode voucher tidak valid atau sudah digunakan.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Hapus Reward',
      'Apakah Anda yakin ingin menghapus reward ini secara permanen?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/distrik/toko/rewards/${id}`);
              setRewards(rewards.filter(r => r.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus reward.');
            }
          }
        }
      ]
    );
  };

  const handlePickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${asset.base64}`;
        setFormData({ ...formData, image_url: dataUri });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal membuka galeri foto.');
    }
  };

  const handleSaveReward = async () => {
    if (!formData.name || !formData.points_cost) {
      return Alert.alert('Error', 'Nama dan Harga Poin wajib diisi.');
    }
    setSaving(true);
    try {
      await api.post('/distrik/toko/rewards', {
        ...formData,
        points_cost: parseInt(formData.points_cost) || 0,
        stock: parseInt(formData.stock) || 0
      });
      setModalVisible(false);
      setFormData({ name: '', points_cost: '', stock: '', image_url: '', category: 'Produk' });
      fetchRewards(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan reward baru.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold[500]} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold[500]} />}
      >
        <View style={dynamicStyles.container}>
          
          {/* Voucher Verification Section */}
          <View style={dynamicStyles.verifyCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
              <Ionicons name="scan-circle" size={24} color={Colors.white} />
              <Text style={dynamicStyles.verifyTitle}>{t('distrik.verify_voucher', {defaultValue: 'Verifikasi Kode Voucher'})}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput 
                style={dynamicStyles.verifyInput} 
                placeholder="Masukkan Kode (Misal: GP-12345)" 
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={dynamicStyles.verifyBtn} onPress={handleVerifyVoucher} disabled={verifying}>
                {verifying ? <ActivityIndicator size="small" color={Colors.gold[600]} /> : <Text style={dynamicStyles.verifyBtnText}>{t('distrik.check', {defaultValue: 'CEK'})}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.headerRow}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={dynamicStyles.title}>Etalase Hadiah (Reward)</Text>
              <Text style={dynamicStyles.subtitle}>{t('distrik.toko_subtitle', {defaultValue: 'Pajang hadiah Anda di sini. Pengguna akan menukarkan poin GP mereka dengan hadiah ini.'})}</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.gold[500], Colors.gold[600]]} style={StyleSheet.absoluteFillObject} borderRadius={28} />
              <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {rewards.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <View style={dynamicStyles.emptyIconWrap}>
                <Ionicons name="gift-outline" size={48} color={Colors.gold[500]} />
              </View>
              <Text style={dynamicStyles.emptyTitle}>{t('distrik.toko_empty', {defaultValue: 'Etalase Masih Kosong'})}</Text>
              <Text style={dynamicStyles.emptySub}>Tambahkan hadiah/reward pertama Anda sekarang dengan menekan tombol + di atas.</Text>
            </View>
          ) : (
            <View style={dynamicStyles.productList}>
              {rewards.map(reward => (
                <View key={reward.id} style={dynamicStyles.productCard}>
                  <Image 
                    source={{ uri: reward.image_url || 'https://via.placeholder.com/150?text=Reward' }} 
                    style={dynamicStyles.productImage} 
                  />
                  <View style={dynamicStyles.productInfo}>
                    <Text style={dynamicStyles.productName} numberOfLines={2}>{reward.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="leaf" size={14} color={Colors.gold[600]} style={{ marginRight: 4 }} />
                      <Text style={dynamicStyles.productPrice}>{reward.points_cost} GP</Text>
                    </View>
                    <View style={dynamicStyles.stockBadge}>
                      <Text style={dynamicStyles.productStock}>Sisa Stok: {reward.stock} pcs</Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.productActions}>
                    <TouchableOpacity style={[dynamicStyles.actionBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : Colors.error + '15' }]} onPress={() => handleDelete(reward.id)}>
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      {/* ADD REWARD MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Tambah Hadiah (Reward)</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={dynamicStyles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              
              <View style={dynamicStyles.imagePickerContainer}>
                <TouchableOpacity style={dynamicStyles.imagePickerBtn} onPress={handlePickImage} activeOpacity={0.8}>
                  {formData.image_url ? (
                    <Image source={{ uri: formData.image_url }} style={dynamicStyles.previewImage} />
                  ) : (
                    <View style={dynamicStyles.imagePickerPlaceholder}>
                      <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13, fontWeight: '600' }}>{t('distrik.pick_image', {defaultValue: 'Pilih Gambar'})}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Nama Hadiah *</Text>
                <TextInput style={dynamicStyles.input} placeholder="Misal: Tumbler Bambu" placeholderTextColor={colors.textMuted} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[dynamicStyles.formGroup, { flex: 1 }]}>
                  <Text style={dynamicStyles.label}>Harga (Poin GP) *</Text>
                  <TextInput style={dynamicStyles.input} placeholder="500" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={formData.points_cost} onChangeText={t => setFormData({...formData, points_cost: t})} />
                </View>
                <View style={[dynamicStyles.formGroup, { flex: 1 }]}>
                  <Text style={dynamicStyles.label}>{t('distrik.stock', {defaultValue: 'Stok'})}</Text>
                  <TextInput style={dynamicStyles.input} placeholder="10" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={formData.stock} onChangeText={t => setFormData({...formData, stock: t})} />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={[dynamicStyles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveReward} disabled={saving} activeOpacity={0.9}>
              <LinearGradient colors={[Colors.gold[500], Colors.gold[600]]} style={StyleSheet.absoluteFillObject} start={{x:0, y:0}} end={{x:1, y:1}} />
              {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.saveBtnText}>Simpan & Publikasikan</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  
  verifyCard: {
    backgroundColor: Colors.green[600],
    borderRadius: BorderRadius['xl'],
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    ...Shadows.md,
  },
  verifyTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  verifyInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    color: Colors.white,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    height: 48,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: { color: Colors.green[700], fontWeight: '900', fontSize: 14 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['2xl'] },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  
  addBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...Shadows.md },

  productList: { gap: Spacing.xl },
  productCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: BorderRadius['2xl'], padding: Spacing.md, borderWidth: 1, borderColor: colors.border, ...Shadows.md, shadowOpacity: 0.05 },
  productImage: { width: 90, height: 90, borderRadius: BorderRadius.xl, backgroundColor: colors.bg },
  productInfo: { flex: 1, marginLeft: Spacing.lg, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  productPrice: { fontSize: 16, fontWeight: '900', color: Colors.gold[600] },
  stockBadge: { alignSelf: 'flex-start', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  productStock: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  
  productActions: { padding: Spacing.xs, justifyContent: 'center' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.gold[500] + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: BorderRadius['3xl'], borderTopRightRadius: BorderRadius['3xl'], padding: Spacing.xl, maxHeight: '90%', ...Shadows.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  closeBtn: { padding: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[100], borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  
  imagePickerContainer: { marginBottom: Spacing.xl, alignItems: 'center' },
  imagePickerBtn: { width: 140, height: 140, borderRadius: BorderRadius['2xl'], overflow: 'hidden', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.bg },
  imagePickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },

  formGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 8 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: 15, color: colors.text, fontWeight: '600' },
  
  saveBtn: { borderRadius: BorderRadius.xl, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, overflow: 'hidden', ...Shadows.md },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});
