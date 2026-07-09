import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Tunaikan <Text style={{ color: Colors.green[400] }}>ZISWAF</Text></Text>
        <Text style={styles.pageDesc}>Salurkan secara digital. Transparan dan berdampak.</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? Colors.white : Colors.gray[500]} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Programs / Calculator */}
        {activeTab === 'kalkulator' ? (
          <Card style={styles.programCard}>
            <Text style={styles.programTitle}>Kalkulator Zakat Penghasilan</Text>
            <Text style={styles.programDesc}>Hitung kewajiban zakat dari pendapatan Anda (Nisab: Rp 6.859.000 / bulan).</Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Penghasilan Rutin per Bulan</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.gray[500]}
                  value={income}
                  onChangeText={setIncome}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Penghasilan Tambahan / Bonus</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.gray[500]}
                  value={bonus}
                  onChangeText={setBonus}
                />
              </View>
            </View>

            {zakatAmount > 0 ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Total Zakat Wajib (2,5%)</Text>
                <Text style={styles.resultAmount}>{fmt(zakatAmount)}</Text>
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
              <View style={[styles.resultBox, { backgroundColor: Colors.dark.surface2 }]}>
                <Text style={styles.resultLabel}>Penghasilan Anda belum mencapai Nisab.</Text>
                <Text style={[styles.resultAmount, { color: Colors.gray[400], fontSize: 16 }]}>Belum Wajib Zakat</Text>
              </View>
            )}
          </Card>
        ) : loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : currentPrograms.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.gray[600]} />
            <Text style={{ color: Colors.gray[500], marginTop: Spacing.md }}>Belum ada program di kategori ini.</Text>
          </View>
        ) : (
          currentPrograms.map((p) => {
            const progress = (Number(p.collected_amount) / Number(p.target_amount)) * 100;
            return (
              <Card key={p.id} style={styles.programCard}>
                <Text style={styles.programTitle}>{p.title}</Text>
                <Text style={styles.programDesc}>{p.description}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>Terkumpul: <Text style={{ color: Colors.green[400], fontWeight: '700' }}>{fmt(p.collected_amount)}</Text></Text>
                  <Text style={styles.progressText}>Target: {fmt(p.target_amount)}</Text>
                </View>
                <View style={styles.quickGrid}>
                  {quickAmounts.map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.quickBtn, selectedAmount === amt && styles.quickBtnActive]}
                      onPress={() => setSelectedAmount(amt)}
                    >
                      <Text style={[styles.quickText, selectedAmount === amt && styles.quickTextActive]}>{fmt(amt)}</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.white },
  pageDesc: { fontSize: 14, color: Colors.gray[400], marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg },
  tabActive: { backgroundColor: Colors.green[600] },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.gray[500] },
  tabTextActive: { color: Colors.white },
  programCard: { marginBottom: Spacing.base },
  programTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  programDesc: { fontSize: 13, color: Colors.gray[400], marginBottom: Spacing.md },
  progressBar: { height: 6, backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.green[500], borderRadius: BorderRadius.full },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progressText: { fontSize: 11, color: Colors.gray[500] },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  quickBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface2 },
  quickBtnActive: { borderColor: Colors.green[500], backgroundColor: 'rgba(16,185,129,0.1)' },
  quickText: { fontSize: 11, fontWeight: '600', color: Colors.gray[300] },
  quickTextActive: { color: Colors.green[400] },
  label: { fontSize: 13, color: Colors.gray[400], marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  currencyPrefix: { color: Colors.gray[400], fontSize: 16, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: Spacing.md },
  resultBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: Colors.green[500],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  resultLabel: { color: Colors.green[400], fontSize: 14, fontWeight: '600', marginBottom: 4 },
  resultAmount: { color: Colors.white, fontSize: 24, fontWeight: '800' },
});
