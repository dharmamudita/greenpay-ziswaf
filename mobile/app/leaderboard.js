import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/impact/leaderboard');
      setLeaders(response.data);
    } catch (error) {
      console.log('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const isTop1 = index === 0;
    const isTop2 = index === 1;
    const isTop3 = index === 2;
    const isPodium = isTop1 || isTop2 || isTop3;
    
    let rankColor = colors.textMuted;
    let rankIcon = null;
    let gradientColors = [colors.surface, colors.surface];

    if (isTop1) {
      rankColor = Colors.gold[400];
      rankIcon = 'trophy';
      gradientColors = isDark ? [Colors.gold[600] + '30', Colors.gold[600] + '10'] : [Colors.gold[100], Colors.surface];
    } else if (isTop2) {
      rankColor = isDark ? Colors.gray[300] : Colors.gray[400];
      rankIcon = 'medal';
      gradientColors = isDark ? [Colors.gray[600] + '30', Colors.gray[600] + '10'] : [Colors.gray[100], Colors.surface];
    } else if (isTop3) {
      rankColor = '#cd7f32'; // Bronze
      rankIcon = 'medal';
      gradientColors = isDark ? ['#cd7f3230', '#cd7f3210'] : ['#FDF1E7', Colors.surface];
    }

    const CardComponent = isPodium ? LinearGradient : View;
    const cardProps = isPodium ? { colors: gradientColors, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } : {};

    return (
      <View style={isPodium ? Shadows.md : Shadows.sm}>
        <CardComponent {...cardProps} style={[dynamicStyles.card, isTop1 && { borderColor: Colors.gold[400], borderWidth: 1.5 }]}>
          <View style={dynamicStyles.rankContainer}>
            {isPodium ? (
              <Ionicons name={rankIcon} size={isTop1 ? 32 : 28} color={rankColor} />
            ) : (
              <Text style={dynamicStyles.rankText}>{index + 1}</Text>
            )}
          </View>

          <View style={dynamicStyles.userInfo}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={[dynamicStyles.avatar, isTop1 && { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: Colors.gold[400] }]} />
            ) : (
              <View style={[dynamicStyles.avatarPlaceholder, isTop1 && { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: Colors.gold[400] }]}>
                <Text style={dynamicStyles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={[dynamicStyles.userName, isTop1 && { fontSize: 18, color: isDark ? Colors.gold[300] : Colors.gold[600] }]}>{item.display_name}</Text>
              <View style={dynamicStyles.impactBadge}>
                <Ionicons name="leaf" size={12} color={Colors.green[500]} />
                <Text style={dynamicStyles.userImpact}> {item.green_points} GP</Text>
              </View>
            </View>
          </View>
        </CardComponent>
      </View>
    );
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>{t('screens.leaderboard_title')}</Text>
        <Text style={dynamicStyles.subtitle}>{t('screens.leaderboard_desc')}</Text>
      </View>

      {loading ? (
        <View style={dynamicStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.green[500]} />
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={dynamicStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={dynamicStyles.heroSection}>
              <View style={dynamicStyles.heroIconBg}>
                <Ionicons name="trophy" size={56} color={Colors.gold[400]} />
              </View>
              <Text style={dynamicStyles.heroText}>Jadilah yang Terbaik!</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    ...Shadows.sm,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.xl,
  },
  heroIconBg: {
    backgroundColor: isDark ? Colors.gold[600] + '20' : Colors.gold[100],
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  heroText: {
    color: Colors.gold[500],
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankContainer: {
    width: 48,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? Colors.green[900] : Colors.green[50],
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  userImpact: {
    color: Colors.green[500],
    fontSize: 12,
    fontWeight: '700',
  },
});
