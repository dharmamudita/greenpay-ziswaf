import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'zakat', label: 'Zakat', icon: 'cash', color: Colors.gold[400] },
  { id: 'infak', label: 'Infak', icon: 'heart', color: Colors.green[500] },
  { id: 'sedekah', label: 'Sedekah', icon: 'hand-left', color: Colors.pink },
  { id: 'wakaf', label: 'Wakaf', icon: 'business', color: Colors.info },
  { id: 'kalkulator', label: 'Kalkulator', icon: 'calculator', color: Colors.purple },
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
  const [forecasting, setForecasting] = useState(false);
  
  // States for Zakat Calculator
  const [income, setIncome] = useState('');
  const [bonus, setBonus] = useState('');
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

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

  const predictImpact = async (title) => {
    const finalAmount = selectedAmount || parseInt(customAmount);
    if (!finalAmount || finalAmount < 10000) {
      Alert.alert('Info', 'Pilih nominal donasi terlebih dahulu untuk melihat prediksi dampaknya oleh AI ✨.');
      return;
    }

    setForecasting(true);
    try {
      const response = await api.post('/ai/impact', {
        points: finalAmount,
        campaignType: title
      });
      
      if (response.data.error) {
         Alert.alert('Gagal', response.data.error);
      } else {
         Alert.alert('Prediksi Dampak AI 🌍', response.data.forecast);
      }
    } catch (error) {
      Alert.alert('Error AI', error.response?.data?.error || 'Gagal memanggil AI. Pastikan API Key di backend sudah diatur.');
    } finally {
      setForecasting(false);
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
      
      {/* Header Section */}
      <View style={dynamicStyles.headerContainer}>
        <Text style={dynamicStyles.pageTitle}>{t('ziswaf.title')} <Text style={{ color: Colors.green[500] }}>{t('ziswaf.title_highlight')}</Text></Text>
        <Text style={dynamicStyles.pageDesc}>{t('ziswaf.subtitle')}</Text>
        
        {/* Inspirational Quote Card */}
        <View style={dynamicStyles.quoteCard}>
          <Ionicons name="leaf-outline" size={24} color={Colors.green[500]} style={{ marginRight: 12 }} />
          <Text style={dynamicStyles.quoteText}>
            "Harta tidak akan berkurang dengan sedekah. Dan seorang hamba yang pemaaf pasti akan Allah tambahkan kewibawaan baginya."
          </Text>
        </View>
      </View>

      {/* Modern Scrollable Pill Tabs */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.tabsScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                dynamicStyles.pillTab, 
                activeTab === tab.id && dynamicStyles.pillTabActive
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? Colors.white : (isDark ? Colors.gray[400] : Colors.gray[500])} 
              />
              <Text style={[
                dynamicStyles.pillTabText, 
                activeTab === tab.id && dynamicStyles.pillTabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={dynamicStyles.contentContainer}>
        {/* Programs / Calculator */}
        {activeTab === 'kalkulator' ? (
          <Card style={dynamicStyles.calculatorCard}>
            <View style={dynamicStyles.cardHeader}>
              <View style={dynamicStyles.iconWrapper}>
                <Ionicons name="calculator" size={24} color={Colors.green[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.programTitle}>Kalkulator Zakat</Text>
                <Text style={dynamicStyles.programDesc}>Nisab: Rp 6.859.000 / bulan</Text>
              </View>
            </View>
            
            <View style={dynamicStyles.inputSection}>
              <Text style={dynamicStyles.label}>Penghasilan Rutin per Bulan</Text>
              <View style={dynamicStyles.fintechInputWrapper}>
                <Text style={dynamicStyles.fintechCurrency}>Rp</Text>
                <TextInput
                  style={dynamicStyles.fintechInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={income}
                  onChangeText={setIncome}
                />
              </View>
            </View>

            <View style={dynamicStyles.inputSection}>
              <Text style={dynamicStyles.label}>Penghasilan Tambahan / Bonus</Text>
              <View style={dynamicStyles.fintechInputWrapper}>
                <Text style={dynamicStyles.fintechCurrency}>Rp</Text>
                <TextInput
                  style={dynamicStyles.fintechInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={bonus}
                  onChangeText={setBonus}
                />
              </View>
            </View>

            {zakatAmount > 0 ? (
              <View style={dynamicStyles.fintechResultBox}>
                <Text style={dynamicStyles.fintechResultLabel}>Total Zakat Wajib (2,5%)</Text>
                <Text style={dynamicStyles.fintechResultAmount}>{fmt(zakatAmount)}</Text>
                <Button 
                  title="Tunaikan Zakat Sekarang" 
                  onPress={() => {
                    setActiveTab('zakat');
                    setSelectedAmount(zakatAmount);
                  }}
                  style={dynamicStyles.fintechBtn}
                />
              </View>
            ) : (
              <View style={[dynamicStyles.fintechResultBox, dynamicStyles.fintechResultBoxDisabled]}>
                <Text style={[dynamicStyles.fintechResultLabel, { color: colors.textMuted }]}>
                  Total penghasilan belum mencapai nisab wajib zakat bulanan.
                </Text>
                <Text style={[dynamicStyles.fintechResultAmount, { color: colors.textMuted, fontSize: 18, marginTop: 8 }]}>
                  Belum Wajib Zakat
                </Text>
              </View>
            )}
          </Card>
        ) : loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : currentPrograms.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconBox}>
              <Ionicons name="folder-open-outline" size={48} color={isDark ? Colors.gray[600] : Colors.gray[300]} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>Belum Ada Program</Text>
            <Text style={dynamicStyles.emptyDesc}>Saat ini belum ada program yang aktif di kategori ini.</Text>
          </View>
        ) : (
          currentPrograms.map((p) => {
            const progress = Math.min((Number(p.collected_amount) / Number(p.target_amount)) * 100, 100);
            return (
              <Card key={p.id} style={dynamicStyles.programCard}>
                <Text style={dynamicStyles.programTitle}>{p.title}</Text>
                <Text style={dynamicStyles.programDesc}>{p.description}</Text>
                
                {/* Thick Modern Progress Bar */}
                <View style={dynamicStyles.progressContainer}>
                  <View style={dynamicStyles.progressBarBg}>
                    <View style={[dynamicStyles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={dynamicStyles.progressPercentage}>{progress.toFixed(0)}%</Text>
                </View>

                <View style={dynamicStyles.progressInfoRow}>
                  <View>
                    <Text style={dynamicStyles.progressLabel}>Terkumpul</Text>
                    <Text style={dynamicStyles.progressValueGreen}>{fmt(p.collected_amount)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={dynamicStyles.progressLabel}>Target</Text>
                    <Text style={dynamicStyles.progressValue}>{fmt(p.target_amount)}</Text>
                  </View>
                </View>

                <View style={dynamicStyles.quickGrid}>
                  {quickAmounts.map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[dynamicStyles.quickBtn, selectedAmount === amt && dynamicStyles.quickBtnActive]}
                      onPress={() => setSelectedAmount(amt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[dynamicStyles.quickText, selectedAmount === amt && dynamicStyles.quickTextActive]}>
                        {fmt(amt).replace(',00', '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }}>
                  <TouchableOpacity 
                    style={[dynamicStyles.actionBtn, dynamicStyles.actionBtnOutline]}
                    onPress={() => predictImpact(p.title)} 
                    disabled={donating === p.id || forecasting}
                  >
                    {forecasting ? (
                      <ActivityIndicator size="small" color={Colors.green[500]} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={16} color={Colors.green[500]} style={{ marginRight: 6 }} />
                        <Text style={dynamicStyles.actionBtnOutlineText}>Prediksi AI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[dynamicStyles.actionBtn, dynamicStyles.actionBtnSolid]}
                    onPress={() => handleDonate(p.id, p.title)} 
                    disabled={donating === p.id || forecasting}
                  >
                    {donating === p.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Text style={dynamicStyles.actionBtnSolidText}>Tunaikan</Text>
                        <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
  headerContainer: { padding: Spacing.xl, paddingTop: Spacing['2xl'] },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: Spacing.xl, lineHeight: 22 },
  
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.surface2 : Colors.green[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: isDark ? colors.border : Colors.green[100],
    alignItems: 'center',
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: isDark ? colors.textMuted : Colors.green[800],
    fontStyle: 'italic',
  },

  tabsScrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.05, // Make shadow very subtle
  },
  pillTabActive: {
    backgroundColor: Colors.green[500],
    borderColor: Colors.green[500],
  },
  pillTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? Colors.gray[300] : Colors.gray[600],
    marginLeft: 8,
  },
  pillTabTextActive: {
    color: Colors.white,
  },

  contentContainer: { padding: Spacing.xl, paddingTop: Spacing.md },
  
  programCard: {
    marginBottom: Spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: BorderRadius.2xl,
    padding: Spacing.xl,
    ...Shadows.md,
    shadowOpacity: 0.08,
  },
  programTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6, letterSpacing: -0.3 },
  programDesc: { fontSize: 14, color: colors.textMuted, marginBottom: Spacing.xl, lineHeight: 22 },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: isDark ? colors.surface3 : Colors.gray[100],
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.green[500],
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.green[500],
    width: 35,
    textAlign: 'right',
  },
  
  progressInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  progressLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4, fontWeight: '500' },
  progressValueGreen: { fontSize: 15, color: Colors.green[500], fontWeight: '800' },
  progressValue: { fontSize: 15, color: colors.text, fontWeight: '700' },
  
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.xl },
  quickBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? colors.border : Colors.gray[200],
    backgroundColor: isDark ? colors.surface2 : Colors.white,
  },
  quickBtnActive: { 
    borderColor: Colors.green[500], 
    backgroundColor: isDark ? 'rgba(22, 94, 46, 0.15)' : Colors.green[50],
  },
  quickText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  quickTextActive: { color: Colors.green[500] },
  
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.green[500],
  },
  actionBtnSolid: {
    backgroundColor: Colors.green[500],
  },
  actionBtnOutlineText: { color: Colors.green[500], fontSize: 15, fontWeight: '700' },
  actionBtnSolidText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Calculator Styles
  calculatorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: BorderRadius.2xl,
    padding: Spacing.xl,
    ...Shadows.md,
    shadowOpacity: 0.08,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? 'rgba(22, 94, 46, 0.15)' : Colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inputSection: { marginBottom: Spacing.lg },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '600' },
  fintechInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    borderWidth: 1,
    borderColor: isDark ? colors.border : Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
  },
  fintechCurrency: { color: colors.textMuted, fontSize: 18, fontWeight: '700', marginRight: 12 },
  fintechInput: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '700', paddingVertical: 16 },
  
  fintechResultBox: {
    backgroundColor: isDark ? 'rgba(22, 94, 46, 0.15)' : Colors.green[50],
    borderWidth: 1,
    borderColor: Colors.green[500],
    borderRadius: 16,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  fintechResultBoxDisabled: {
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    borderColor: isDark ? colors.border : Colors.gray[200],
  },
  fintechResultLabel: { color: Colors.green[600], fontSize: 14, fontWeight: '600', marginBottom: 8 },
  fintechResultAmount: { color: isDark ? Colors.green[400] : Colors.green[700], fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  fintechBtn: { marginTop: Spacing.lg, width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: Colors.green[500] },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  }
});
