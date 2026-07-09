import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button, Card } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import api from '../../services/api';

const tabs = [
  { id: 'zakat', label: 'Zakat', icon: 'cash', color: Colors.gold[400] },
  { id: 'infak', label: 'Infak', icon: 'heart', color: Colors.green[500] },
  { id: 'sedekah', label: 'Sedekah', icon: 'hand-left', color: Colors.pink },
  { id: 'wakaf', label: 'Wakaf', icon: 'business', color: Colors.info },
  { id: 'kalkulator', label: 'Kalkulator', icon: 'calculator', color: Colors.info },
];

const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
const NISAB_PER_BULAN = 6859000;

export default function ZiswafScreen() {
  const [activeTab, setActiveTab] = useState('zakat');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(null);
  
  // States for Zakat Calculator
  const [income, setIncome] = useState('');
  const [bonus, setBonus] = useState('');
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ziswaf/programs');
      setPrograms(res.data);
    } catch (error) {
      console.log('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (programId, title) => {
    const finalAmount = selectedAmount || parseInt(customAmount);
    if (!finalAmount || finalAmount < 10000) {
      Alert.alert('Info', 'Minimal donasi adalah Rp 10.000');
      return;
    }

    Alert.alert(
      "Konfirmasi Donasi",
      `Tunaikan ${title} sebesar ${fmt(finalAmount)}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Tunaikan", 
          onPress: async () => {
            try {
              setDonating(programId);
              await api.post('/ziswaf/donate', {
                programId: programId,
                amount: finalAmount
              });
              Alert.alert('Alhamdulillah', 'Donasi Anda berhasil disalurkan.');
              setCustomAmount('');
              setSelectedAmount(null);
              fetchPrograms(); // Refresh progress
            } catch (error) {
              console.log('Error donating:', error);
              Alert.alert('Gagal', 'Terjadi kesalahan saat menyalurkan donasi.');
            } finally {
              setDonating(null);
            }
          }
        }
      ]
    );
  };

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const totalIncome = (parseInt(income) || 0) + (parseInt(bonus) || 0);
  const zakatAmount = totalIncome >= NISAB_PER_BULAN ? totalIncome * 0.025 : 0;

  const currentPrograms = programs.filter(p => p.category === activeTab);

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.pageTitle}>Tunaikan <Text style={{ color: Colors.green[500] }}>ZISWAF</Text></Text>
        <Text style={dynamicStyles.pageDesc}>Salurkan secara digital. Transparan dan berdampak.</Text>

        {/* Tabs */}
        <View style={dynamicStyles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[dynamicStyles.tab, activeTab === tab.id && dynamicStyles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? Colors.white : colors.textMuted} />
              <Text style={[dynamicStyles.tabText, activeTab === tab.id && dynamicStyles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Programs / Calculator */}
        {activeTab === 'kalkulator' ? (
          <Card style={dynamicStyles.programCard}>
            <Text style={dynamicStyles.programTitle}>Kalkulator Zakat Penghasilan</Text>
            <Text style={dynamicStyles.programDesc}>Hitung kewajiban zakat dari pendapatan Anda (Nisab: Rp 6.859.000 / bulan).</Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={dynamicStyles.label}>Penghasilan Rutin per Bulan</Text>
              <View style={dynamicStyles.inputWrapper}>
                <Text style={dynamicStyles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={dynamicStyles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={income}
                  onChangeText={setIncome}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={dynamicStyles.label}>Penghasilan Tambahan / Bonus</Text>
              <View style={dynamicStyles.inputWrapper}>
                <Text style={dynamicStyles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={dynamicStyles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={bonus}
                  onChangeText={setBonus}
                />
              </View>
            </View>

            {zakatAmount > 0 ? (
              <View style={dynamicStyles.resultBox}>
                <Text style={dynamicStyles.resultLabel}>Total Zakat Wajib (2,5%)</Text>
                <Text style={dynamicStyles.resultAmount}>{fmt(zakatAmount)}</Text>
                <Button 
                  title="Tunaikan Sekarang" 
                  onPress={() => {
                    setActiveTab('zakat');
                    setSelectedAmount(zakatAmount);
                  }}
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <View style={[dynamicStyles.resultBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={[dynamicStyles.resultLabel, { color: colors.textMuted }]}>Penghasilan Anda belum mencapai Nisab.</Text>
                <Text style={[dynamicStyles.resultAmount, { color: colors.textMuted, fontSize: 16 }]}>Belum Wajib Zakat</Text>
              </View>
            )}
          </Card>
        ) : loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : currentPrograms.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Belum ada program di kategori ini.</Text>
          </View>
        ) : (
          currentPrograms.map((p) => {
            const progress = (Number(p.collected_amount) / Number(p.target_amount)) * 100;
            return (
              <Card key={p.id} style={dynamicStyles.programCard}>
                <Text style={dynamicStyles.programTitle}>{p.title}</Text>
                <Text style={dynamicStyles.programDesc}>{p.description}</Text>
                <View style={dynamicStyles.progressBar}>
                  <View style={[dynamicStyles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={dynamicStyles.progressInfo}>
                  <Text style={dynamicStyles.progressText}>Terkumpul: <Text style={{ color: Colors.green[500], fontWeight: '700' }}>{fmt(p.collected_amount)}</Text></Text>
                  <Text style={dynamicStyles.progressText}>Target: {fmt(p.target_amount)}</Text>
                </View>
                <View style={dynamicStyles.quickGrid}>
                  {quickAmounts.map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[dynamicStyles.quickBtn, selectedAmount === amt && dynamicStyles.quickBtnActive]}
                      onPress={() => setSelectedAmount(amt)}
                    >
                      <Text style={[dynamicStyles.quickText, selectedAmount === amt && dynamicStyles.quickTextActive]}>{fmt(amt)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button 
                  title={donating === p.id ? "Memproses..." : "Donasi Sekarang"} 
                  onPress={() => handleDonate(p.id, p.title)} 
                  disabled={donating === p.id}
                />
              </Card>
            );
          })
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  pageDesc: { fontSize: 14, color: colors.textMuted, marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.lg, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg },
  tabActive: { backgroundColor: Colors.green[600] },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: Colors.white },
  programCard: { marginBottom: Spacing.base, backgroundColor: colors.surface, borderColor: colors.border },
  programTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  programDesc: { fontSize: 13, color: colors.textMuted, marginBottom: Spacing.md },
  progressBar: { height: 6, backgroundColor: colors.surface2, borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.green[500], borderRadius: BorderRadius.full },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progressText: { fontSize: 11, color: colors.textMuted },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  quickBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2 },
  quickBtnActive: { borderColor: Colors.green[500], backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)' },
  quickText: { fontSize: 11, fontWeight: '600', color: colors.text },
  quickTextActive: { color: Colors.green[500] },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  currencyPrefix: { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: Spacing.md },
  resultBox: {
    backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
    borderWidth: 1,
    borderColor: Colors.green[500],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  resultLabel: { color: Colors.green[500], fontSize: 14, fontWeight: '600', marginBottom: 4 },
  resultAmount: { color: colors.text, fontSize: 24, fontWeight: '800' },
});
