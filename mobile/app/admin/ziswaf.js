import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import api from '../../services/api';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function AdminZiswafScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [adding, setAdding] = useState(false);

  // Create Program State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newProgram, setNewProgram] = useState({ title: '', description: '', category: 'zakat', target_amount: '' });
  const [creating, setCreating] = useState(false);

  // Distribute State
  const [distributeModalVisible, setDistributeModalVisible] = useState(false);
  const [distributeData, setDistributeData] = useState({ amount: '', description: '' });
  const [distributing, setDistributing] = useState(false);

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchZiswaf();
  }, []);

  const fetchZiswaf = async () => {
    try {
      const res = await api.get('/ziswaf/programs');
      setPrograms(res.data);
    } catch (error) {
      console.log('Error fetching ZISWAF:', error);
      Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.error_load_ziswaf', {defaultValue: 'Gagal memuat data ZISWAF.'}));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchZiswaf();
  };

  const fmtCurrency = (val) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const handleAddManual = async () => {
    if (!manualAmount || isNaN(manualAmount)) {
      return Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.invalid_amount', {defaultValue: 'Masukkan nominal yang valid.'}));
    }
    
    setAdding(true);
    try {
      const amount = parseInt(manualAmount);
      await api.post('/payment/charge', {
        amount,
        program_id: selectedProgram.id,
        program_name: selectedProgram.title
      });
      Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('admin.success_add_fund', {defaultValue: 'Dana berhasil dicatat sebagai tagihan. Segera setujui pembayaran (jika ada webhook).'}));
      setModalVisible(false);
      setManualAmount('');
      fetchZiswaf();
    } catch (error) {
      Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.failed_add_fund', {defaultValue: 'Gagal menambah dana manual.'}));
    } finally {
      setAdding(false);
    }
  };

  const handleDistribute = async () => {
    if (!distributeData.amount || isNaN(distributeData.amount) || !distributeData.description) {
      return Alert.alert('Error', 'Nominal valid dan deskripsi wajib diisi.');
    }
    
    setDistributing(true);
    try {
      await api.post('/ziswaf/distributions', {
        program_id: selectedProgram.id,
        amount: parseInt(distributeData.amount),
        description: distributeData.description
      });
      Alert.alert('Sukses', 'Bukti penyaluran berhasil disimpan dan dipublikasikan.');
      setDistributeModalVisible(false);
      setDistributeData({ amount: '', description: '' });
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan bukti penyaluran.');
    } finally {
      setDistributing(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title || !newProgram.target_amount) {
      return Alert.alert('Error', 'Judul dan target dana wajib diisi.');
    }
    
    setCreating(true);
    try {
      await api.post('/ziswaf/programs', {
        title: newProgram.title,
        description: newProgram.description,
        category: newProgram.category,
        target_amount: parseInt(newProgram.target_amount),
        image_url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500&q=80' // default img
      });
      Alert.alert('Sukses', 'Program ZISWAF baru berhasil dibuat!');
      setCreateModalVisible(false);
      setNewProgram({ title: '', description: '', category: 'zakat', target_amount: '' });
      fetchZiswaf();
    } catch (error) {
      console.log('Error creating program:', error);
      Alert.alert('Error', 'Gagal membuat program baru.');
    } finally {
      setCreating(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gold[500]} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <ScrollView 
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold[500]} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
          <Text style={dynamicStyles.sectionTitle}>{t('admin.active_programs', {defaultValue: 'Program Aktif'})}</Text>
          <TouchableOpacity 
            style={dynamicStyles.createBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={dynamicStyles.createBtnText}>{t('admin.create_new', {defaultValue: 'Buat Baru'})}</Text>
          </TouchableOpacity>
        </View>
        
        {programs.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: 16 }}>{t('admin.no_program', {defaultValue: 'Belum ada program ZISWAF.'})}</Text>
          </View>
        )}

        {programs.map((prog) => {
          const percent = Math.min((prog.collected_amount / prog.target_amount) * 100, 100);
          return (
            <View key={prog.id} style={dynamicStyles.card}>
              <View style={dynamicStyles.cardHeader}>
                <Ionicons name="heart" size={24} color={Colors.gold[500]} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.progTitle}>{prog.title}</Text>
                  <Text style={dynamicStyles.progCategory}>{prog.category.toUpperCase()}</Text>
                </View>
              </View>

              <View style={dynamicStyles.progressWrap}>
                <View style={dynamicStyles.progressTextRow}>
                  <Text style={dynamicStyles.collectedText}>{fmtCurrency(prog.collected_amount)}</Text>
                  <Text style={dynamicStyles.targetText}>dari {fmtCurrency(prog.target_amount)}</Text>
                </View>
                <View style={dynamicStyles.progressBarBg}>
                  <View style={[dynamicStyles.progressBarFill, { width: `${percent}%` }]} />
                </View>
              </View>

              <View style={dynamicStyles.actionRow}>
                <TouchableOpacity 
                  style={dynamicStyles.manualBtn}
                  onPress={() => {
                    setSelectedProgram(prog);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="add-circle" size={16} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={dynamicStyles.manualBtnText}>Tunai</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[dynamicStyles.manualBtn, { backgroundColor: Colors.info, marginLeft: 8 }]}
                  onPress={() => {
                    setSelectedProgram(prog);
                    setDistributeModalVisible(true);
                  }}
                >
                  <Ionicons name="paper-plane" size={16} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={dynamicStyles.manualBtnText}>Salurkan</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal Add Manual */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Tambah Dana Tunai</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            {selectedProgram && (
              <Text style={dynamicStyles.selectedProgText}>Program: {selectedProgram.title}</Text>
            )}

            <Text style={dynamicStyles.inputLabel}>Nominal (Rp)</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Contoh: 50000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={manualAmount}
              onChangeText={setManualAmount}
            />

            <TouchableOpacity 
              style={[dynamicStyles.submitBtn, adding && { opacity: 0.7 }]}
              onPress={handleAddManual}
              disabled={adding}
            >
              {adding ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.submitBtnText}>Simpan Dana</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Create Program */}
      <Modal visible={createModalVisible} transparent={true} animationType="slide">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Buat Program ZISWAF</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text style={dynamicStyles.inputLabel}>Judul Program</Text>
              <TextInput
                style={[dynamicStyles.input, { marginBottom: Spacing.md, fontSize: 14 }]}
                placeholder="Contoh: Bantuan Banjir Demak"
                placeholderTextColor={colors.textMuted}
                value={newProgram.title}
                onChangeText={v => setNewProgram({...newProgram, title: v})}
              />

              <Text style={dynamicStyles.inputLabel}>Deskripsi</Text>
              <TextInput
                style={[dynamicStyles.input, { marginBottom: Spacing.md, fontSize: 14, minHeight: 80 }]}
                placeholder="Jelaskan tujuan program ini..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                value={newProgram.description}
                onChangeText={v => setNewProgram({...newProgram, description: v})}
              />

              <Text style={dynamicStyles.inputLabel}>Kategori</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md }}>
                {['zakat', 'infak', 'sedekah', 'wakaf'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
                      newProgram.category === cat && { backgroundColor: Colors.gold[500], borderColor: Colors.gold[500] }
                    ]}
                    onPress={() => setNewProgram({...newProgram, category: cat})}
                  >
                    <Text style={[
                      { color: colors.text, fontSize: 12, fontWeight: '600' },
                      newProgram.category === cat && { color: Colors.white }
                    ]}>{cat.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={dynamicStyles.inputLabel}>Target Dana (Rp)</Text>
              <TextInput
                style={[dynamicStyles.input, { marginBottom: Spacing.xl, fontSize: 14 }]}
                placeholder="Contoh: 10000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newProgram.target_amount}
                onChangeText={v => setNewProgram({...newProgram, target_amount: v})}
              />
            </ScrollView>

            <TouchableOpacity 
              style={[dynamicStyles.submitBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreateProgram}
              disabled={creating}
            >
              {creating ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.submitBtnText}>Buat Program</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Distribute */}
      <Modal visible={distributeModalVisible} transparent={true} animationType="slide">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Input Penyaluran</Text>
              <TouchableOpacity onPress={() => setDistributeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            {selectedProgram && (
              <Text style={dynamicStyles.selectedProgText}>Program: {selectedProgram.title}</Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
              <Text style={dynamicStyles.inputLabel}>Nominal Disalurkan (Rp)</Text>
              <TextInput
                style={[dynamicStyles.input, { marginBottom: Spacing.md, fontSize: 14 }]}
                placeholder="Contoh: 5000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={distributeData.amount}
                onChangeText={v => setDistributeData({...distributeData, amount: v})}
              />

              <Text style={dynamicStyles.inputLabel}>Deskripsi Penyaluran</Text>
              <TextInput
                style={[dynamicStyles.input, { marginBottom: Spacing.xl, fontSize: 14, minHeight: 80 }]}
                placeholder="Misal: Penyerahan bantuan sembako kepada 50 KK di desa X."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                value={distributeData.description}
                onChangeText={v => setDistributeData({...distributeData, description: v})}
              />
            </ScrollView>

            <TouchableOpacity 
              style={[dynamicStyles.submitBtn, distributing && { opacity: 0.7 }]}
              onPress={handleDistribute}
              disabled={distributing}
            >
              {distributing ? <ActivityIndicator color={Colors.white} /> : <Text style={dynamicStyles.submitBtnText}>Publikasikan Penyaluran</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  createBtn: { flexDirection: 'row', backgroundColor: Colors.green[500], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center', gap: 4 },
  createBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.md,
    shadowOpacity: 0.05
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  progTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  progCategory: { fontSize: 11, color: Colors.gold[500], fontWeight: '800', letterSpacing: 1 },
  
  progressWrap: { marginBottom: Spacing.lg },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
  collectedText: { fontSize: 16, fontWeight: '900', color: Colors.gold[600] },
  targetText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  progressBarBg: { height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.gray[200], borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.gold[400], borderRadius: 4 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  manualBtn: { flexDirection: 'row', backgroundColor: Colors.gold[500], paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.xl, alignItems: 'center' },
  manualBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: BorderRadius['3xl'], borderTopRightRadius: BorderRadius['3xl'], padding: Spacing.xl, paddingBottom: Spacing['3xl'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  selectedProgText: { fontSize: 14, color: Colors.gold[500], fontWeight: '700', marginBottom: Spacing.xl },
  
  inputLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.xl, padding: 14, fontSize: 16, color: colors.text, marginBottom: Spacing['2xl'] },
  
  submitBtn: { backgroundColor: Colors.green[500], padding: 16, borderRadius: BorderRadius.xl, alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
