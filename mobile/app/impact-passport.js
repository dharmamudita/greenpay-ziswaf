import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ImpactPassportScreen() {
  const { user } = useAuth();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    try {
      const res = await api.get('/impact/passport');
      setPassportData(res.data);
    } catch (error) {
      console.log('Error fetching passport:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' Jt';
    if (n >= 1000) return (n / 1000).toFixed(1) + ' Rb';
    return n;
  };

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green[500]} />
      </View>
    );
  }

  const pUser = passportData?.user || user;
  const badges = passportData?.badges || [];

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        {/* Passport Card */}
        <Card style={dynamicStyles.passportCard}>
          <LinearGradient colors={[Colors.green[700], Colors.green[900]]} style={StyleSheet.absoluteFillObject} />
          <View style={dynamicStyles.passHeader}>
            <Text style={dynamicStyles.passTitle}>IMPACT PASSPORT</Text>
            <Ionicons name="leaf" size={24} color={Colors.green[300]} />
          </View>
          
          <View style={dynamicStyles.passBody}>
            <View style={dynamicStyles.avatar}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.white }}>{pUser?.display_name?.[0] || 'A'}</Text>
            </View>
            <View style={dynamicStyles.userInfo}>
              <Text style={dynamicStyles.name}>{pUser?.display_name || 'Ahmad Rizki'}</Text>
              <Text style={dynamicStyles.id}>ID: GPZ-2025-{user?.id?.substring(0,5) || '8X9A2'}</Text>
              <Badge text="Eco Citizen" variant="gold" style={{ marginTop: 4 }} />
            </View>
          </View>

          <View style={dynamicStyles.passStats}>
            <View style={dynamicStyles.passStatItem}>
              <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_waste || 0)} kg</Text>
              <Text style={dynamicStyles.passStatLbl}>Sampah</Text>
            </View>
            <View style={dynamicStyles.passStatItem}>
              <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_donation || 0)}</Text>
              <Text style={dynamicStyles.passStatLbl}>ZISWAF</Text>
            </View>
            <View style={dynamicStyles.passStatItem}>
              <Text style={dynamicStyles.passStatVal}>{pUser?.trees_planted || 0}</Text>
              <Text style={dynamicStyles.passStatLbl}>Pohon</Text>
            </View>
          </View>
        </Card>

        {/* Badges */}
        <Text style={dynamicStyles.sectionTitle}>Pencapaian (Badges)</Text>
        {badges.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="medal-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Belum ada lencana yang didapat.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.badgeGrid}>
            {badges.map((b, i) => (
              <Card key={i} style={dynamicStyles.badgeCard}>
                <Ionicons name={b.icon || 'star'} size={32} color={Colors.gold[400]} />
                <Text style={dynamicStyles.badgeName}>{b.name}</Text>
                <Text style={dynamicStyles.badgeDesc}>{b.desc}</Text>
              </Card>
            ))}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  passportCard: { padding: 0, overflow: 'hidden', borderWidth: 2, borderColor: isDark ? Colors.green[600] : Colors.green[500], marginBottom: Spacing.xl },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  passTitle: { fontSize: 16, fontWeight: '800', color: Colors.green[100], letterSpacing: 2 },
  passBody: { flexDirection: 'row', padding: Spacing.base, gap: Spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 8, backgroundColor: Colors.green[600], alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  id: { fontSize: 11, color: Colors.green[200], fontFamily: 'monospace' },
  passStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', padding: Spacing.base },
  passStatItem: { flex: 1, alignItems: 'center' },
  passStatVal: { fontSize: 16, fontWeight: '800', color: Colors.white },
  passStatLbl: { fontSize: 10, color: Colors.green[200], marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: Spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { width: '31%', padding: Spacing.sm, alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border },
  badgeName: { fontSize: 11, fontWeight: '700', color: Colors.green[500], textAlign: 'center' },
  badgeDesc: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },
});
