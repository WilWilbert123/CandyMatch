import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';
import { getAllGameSessions } from '../utils/storage';

export default function HighScoresScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await getAllGameSessions();
    setSessions(allSessions.slice(0, 20));
    setLoading(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <ActivityIndicator size="large" color={candyTheme.textLight} />
      </LinearGradient>
    );
  }

  const renderScoreItem = ({ item, index }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.playerName}>{item.childName || 'Player'}</Text>
      <Text style={styles.score}>{item.score} pts</Text>
      <View style={styles.starsBox}>
        <Text style={styles.starsText}>{'⭐'.repeat(item.starsEarned || 0)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Top Players 🏆</Text>
      </View>
      
      <View style={styles.scoreHeader}>
        <Text style={styles.headerRank}>Rank</Text>
        <Text style={styles.headerName}>Player</Text>
        <Text style={styles.headerScore}>Score</Text>
        <Text style={styles.headerStars}>Stars</Text>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scores yet! 🎮</Text>
          <Text style={styles.emptySubtext}>Play a game to appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderScoreItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: spacing.large,
  },
  headerTitle: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  scoreHeader: {
    flexDirection: 'row',
    padding: spacing.medium,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.medium,
    borderRadius: 10,
  },
  headerRank: {
    flex: 1,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  headerName: {
    flex: 2,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  headerScore: {
    flex: 1,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  headerStars: {
    flex: 1,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  scoreRow: {
    flexDirection: 'row',
    padding: spacing.medium,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
    borderRadius: 10,
    alignItems: 'center',
  },
  rank: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.candyPurple,
  },
  playerName: {
    flex: 2,
    fontSize: fontSizes.body,
    color: candyTheme.textDark,
  },
  score: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.candyGreen,
  },
  starsBox: {
    flex: 1,
  },
  starsText: {
    fontSize: fontSizes.small,
  },
  list: {
    paddingBottom: spacing.large,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.subtitle,
    color: candyTheme.textLight,
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
  },
});