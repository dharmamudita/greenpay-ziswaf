import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function GreenPointScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/green-points/history');
      setHistory(res.data);
    } catch (error) {
      console.log('Error fetching GP history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForSource = (source) => {
    switch(source) {
      case 'waste_deposit': return 'refresh-circle';
      case 'donation': return 'heart';
      case 'purchase': return 'cart';
      case 'reward': return 'gift';
      default: return 'leaf';
    }
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        {/* Balance Card */}
        <View style={dynamicStyles.balanceCard}>
          <LinearGradient colors={[Colors.green[700], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={dynamicStyles.balanceContent}>
            <Ionicons name="leaf" size={36} color={Colors.green[300]} />
            <Text style={dynamicStyles.balanceLabel}>{t('green_point.balance')}</Text>
            <Text style={dynamicStyles.balanceValue}>{user?.green_points?.toLocaleString() || 0}</Text>
            <Text style={dynamicStyles.balanceSub}>{t('green_point.subtitle')}</Text>
            <View style={dynamicStyles.balanceBtns}>
              <Button title={t('green_point.redeem')} variant="gold" onPress={() => router.push('/reward')} />
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <Text style={dynamicStyles.sectionTitle}>
          <Ionicons name="flame" size={18} color={Colors.gold[400]} /> {t('green_point.history')}
        </Text>
        
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : history.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Belum ada aktivitas poin.</Text>
          </View>
        ) : (
          history.map((act) => (
            <Card key={act.id} style={dynamicStyles.activityCard}>
              <Ionicons name={getIconForSource(act.source)} size={22} color={Colors.green[500]} />
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.actAction}>{act.description}</Text>
                <Text style={dynamicStyles.actTime}>{formatTime(act.created_at)}</Text>
              </View>
              <Badge 
                text={`${act.type === 'earn' ? '+' : '-'}${act.points} GP`} 
                variant={act.type === 'earn' ? 'green' : 'info'}
              />
            </Card>
          ))
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  balanceCard: { borderRadius: BorderRadius['2xl'], overflow: 'hidden', marginBottom: Spacing.xl, borderWidth: 1, borderColor: isDark ? Colors.green[700] : Colors.green[600] },
  balanceContent: { padding: Spacing.xl, alignItems: 'center' },
  balanceLabel: { color: Colors.green[100], fontSize: 13, fontWeight: '600', marginTop: Spacing.sm },
  balanceValue: { fontSize: 48, fontWeight: '800', color: Colors.white },
  balanceSub: { color: Colors.green[200], fontSize: 12, marginBottom: Spacing.lg },
  balanceBtns: { flexDirection: 'row', gap: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  actAction: { fontSize: 13, fontWeight: '600', color: colors.text },
  actTime: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
