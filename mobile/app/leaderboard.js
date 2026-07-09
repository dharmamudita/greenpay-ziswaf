import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import api from '../services/api';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    let rankColor = Colors.gray[400];
    let rankIcon = null;

    if (index === 0) {
      rankColor = Colors.gold[400];
      rankIcon = 'medal';
    } else if (index === 1) {
      rankColor = Colors.gray[300]; // Silver
      rankIcon = 'medal-outline';
    } else if (index === 2) {
      rankColor = '#cd7f32'; // Bronze
      rankIcon = 'medal-outline';
    }

    return (
      <View style={[styles.card, isTop3 && styles.cardTop3]}>
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <Ionicons name={rankIcon} size={24} color={rankColor} />
          ) : (
            <Text style={styles.rankText}>#{index + 1}</Text>
          )}
        </View>

        <View style={styles.userInfo}>
          {item.photo_url ? (
            <Image source={{ uri: item.photo_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{item.display_name}</Text>
            <Text style={styles.userImpact}>
              <Ionicons name="leaf" size={12} color={Colors.green[400]} /> {item.green_points} GP
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Peringkat Kebaikan</Text>
        <Text style={styles.subtitle}>Top 10 Pejuang Lingkungan</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.green[500]} />
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.heroSection}>
              <Ionicons name="trophy" size={64} color={Colors.gold[400]} />
              <Text style={styles.heroText}>Jadilah yang Terbaik!</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    padding: Spacing.xl,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[400],
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
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardTop3: {
    borderColor: Colors.gold[600],
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    color: Colors.gray[400],
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
    backgroundColor: Colors.dark.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userImpact: {
    color: Colors.gray[400],
    fontSize: 13,
  },
});
