import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge } from '../components/ui';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
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
        <View style={[dynamicStyles.passportWrapper, Shadows.lg]}>
          <LinearGradient 
            colors={[isDark ? Colors.green[800] : Colors.green[500], isDark ? Colors.dark.bg : Colors.green[700]]} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={dynamicStyles.passportCard}
          >
            <View style={dynamicStyles.passHeader}>
              <View>
                <Text style={dynamicStyles.passTitle}>IMPACT PASSPORT</Text>
                <Text style={{ color: Colors.green[200], fontSize: 10, letterSpacing: 1 }}>GLOBAL CITIZEN</Text>
              </View>
              <Ionicons name="finger-print" size={32} color="rgba(255,255,255,0.2)" />
            </View>
            
            <View style={dynamicStyles.passBody}>
              <View style={dynamicStyles.avatarWrapper}>
                <LinearGradient colors={[Colors.gold[400], Colors.gold[600]]} style={dynamicStyles.avatar}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.white }}>{pUser?.display_name?.[0] || 'A'}</Text>
                </LinearGradient>
              </View>
              <View style={dynamicStyles.userInfo}>
                <Text style={dynamicStyles.name}>{pUser?.display_name || 'Ahmad Rizki'}</Text>
                <Text style={dynamicStyles.id}>ID: GPZ-2025-{user?.id?.substring(0,5) || '8X9A2'}</Text>
                <Badge text="Eco Citizen" variant="gold" style={{ marginTop: 6 }} />
              </View>
            </View>

            <View style={dynamicStyles.passStatsWrapper}>
              <View style={dynamicStyles.passStats}>
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_waste || 0)} kg</Text>
                  <Text style={dynamicStyles.passStatLbl}>Sampah</Text>
                </View>
                <View style={dynamicStyles.passStatDivider} />
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{fmt(pUser?.total_donation || 0)}</Text>
                  <Text style={dynamicStyles.passStatLbl}>ZISWAF</Text>
                </View>
                <View style={dynamicStyles.passStatDivider} />
                <View style={dynamicStyles.passStatItem}>
                  <Text style={dynamicStyles.passStatVal}>{pUser?.trees_planted || 0}</Text>
                  <Text style={dynamicStyles.passStatLbl}>Pohon</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Badges */}
        <Text style={dynamicStyles.sectionTitle}>Pencapaian Eksklusif</Text>
        {badges.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="medal-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Belum ada pencapaian yang didapat.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.badgeGrid}>
            {badges.map((b, i) => (
              <Card key={i} style={dynamicStyles.badgeCard}>
                <LinearGradient 
                  colors={[Colors.gold[400] + '20', 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name={b.icon || 'star'} size={36} color={Colors.gold[500]} />
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
  passportWrapper: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: isDark ? Colors.dark.surface : Colors.green[600],
  },
  passportCard: { 
    borderRadius: BorderRadius['2xl'],
    padding: 0, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)'
  },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, paddingBottom: 0 },
  passTitle: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  passBody: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.lg, alignItems: 'center' },
  avatarWrapper: { padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.xl },
  avatar: { width: 72, height: 72, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 2, letterSpacing: -0.5 },
  id: { fontSize: 13, color: Colors.green[100], fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },
  passStatsWrapper: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  passStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.25)', padding: Spacing.base, borderRadius: BorderRadius.xl, alignItems: 'center' },
  passStatItem: { flex: 1, alignItems: 'center' },
  passStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  passStatVal: { fontSize: 18, fontWeight: '900', color: Colors.white },
  passStatLbl: { fontSize: 11, color: Colors.green[100], marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { width: '48%', padding: Spacing.md, alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  badgeName: { fontSize: 14, fontWeight: '800', color: colors.text, textAlign: 'center' },
  badgeDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
