import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import api from '../services/api';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();

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
    const isTop3 = index < 3;
    let rankColor = colors.textMuted;
    let rankIcon = null;

    if (index === 0) {
      rankColor = Colors.gold[400];
      rankIcon = 'medal';
    } else if (index === 1) {
      rankColor = isDark ? Colors.gray[300] : Colors.gray[500]; // Silver
      rankIcon = 'medal-outline';
    } else if (index === 2) {
      rankColor = '#cd7f32'; // Bronze
      rankIcon = 'medal-outline';
    }

    return (
      <View style={[dynamicStyles.card, isTop3 && dynamicStyles.cardTop3]}>
        <View style={dynamicStyles.rankContainer}>
          {isTop3 ? (
            <Ionicons name={rankIcon} size={24} color={rankColor} />
          ) : (
            <Text style={dynamicStyles.rankText}>#{index + 1}</Text>
          )}
        </View>

        <View style={dynamicStyles.userInfo}>
          {item.photo_url ? (
            <Image source={{ uri: item.photo_url }} style={dynamicStyles.avatar} />
          ) : (
            <View style={dynamicStyles.avatarPlaceholder}>
              <Text style={dynamicStyles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={dynamicStyles.userName}>{item.display_name}</Text>
            <Text style={dynamicStyles.userImpact}>
              <Ionicons name="leaf" size={12} color={Colors.green[500]} /> {item.green_points} GP
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Peringkat Kebaikan</Text>
        <Text style={dynamicStyles.subtitle}>Top 10 Pejuang Lingkungan</Text>
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
              <Ionicons name="trophy" size={64} color={Colors.gold[400]} />
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
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
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  heroText: {
    color: Colors.gold[400],
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop3: {
    borderColor: isDark ? Colors.gold[600] : Colors.gold[400],
    backgroundColor: isDark ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.1)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: 'bold',
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userImpact: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
