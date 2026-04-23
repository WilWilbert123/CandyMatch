import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';
import {
  getAllGameSessions,
  getAverageScore,
  getCompletedLevelsCount,
  getTopScores,
  getTotalStarsEarned
} from '../utils/storage';

export default function HighScoresScreen({ navigation }) {
  const [highScores, setHighScores] = useState([]);
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'level1', 'level2', etc.

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const sessions = await getAllGameSessions();
    const stars = await getTotalStarsEarned();
    const levels = await getCompletedLevelsCount();
    const avgScore = await getAverageScore();
    const top = await getTopScores(10);
    
    setHighScores(sessions);
    setTopScores(top);
    setTotalStars(stars);
    setCompletedLevels(levels);
    setAverageScore(avgScore);
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStarRating = (stars) => {
    return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  };

  const getLevelBadgeColor = (level) => {
    if (level <= 20) return '#4CAF50';
    if (level <= 40) return '#2196F3';
    if (level <= 60) return '#FF9800';
    if (level <= 80) return '#9C27B0';
    return '#F44336';
  };

  const filteredScores = filter === 'all' 
    ? highScores 
    : highScores.filter(session => session.levelNumber === parseInt(filter));

  const renderTopScoreItem = ({ item, index }) => (
    <LinearGradient
      colors={index === 0 ? ['#FFD700', '#FFA500'] : index === 1 ? ['#C0C0C0', '#A8A8A8'] : index === 2 ? ['#CD7F32', '#B87333'] : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
      style={styles.topScoreCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.topRankContainer}>
        <Text style={styles.topRank}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
        </Text>
      </View>
      <View style={styles.topScoreDetails}>
        <Text style={styles.topPlayerName}>{item.childName}</Text>
        <Text style={styles.topLevelText}>Level {item.levelNumber}</Text>
        <View style={styles.topStats}>
          <Text style={styles.topScore}>{item.score} pts</Text>
          <Text style={styles.topStars}>{getStarRating(item.starsEarned)}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderScoreItem = ({ item, index }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.scoreCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreHeader}>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelBadgeText, { backgroundColor: getLevelBadgeColor(item.levelNumber) }]}>
              Level {item.levelNumber}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.playedAt)}</Text>
        </View>

        <View style={styles.scoreMain}>
          <View style={styles.scoreLeft}>
            <Text style={styles.playerName}>{item.childName}</Text>
            <View style={styles.starsContainer}>
              <Text style={styles.starsText}>{getStarRating(item.starsEarned)}</Text>
            </View>
          </View>
          
          <View style={styles.scoreRight}>
            <Text style={styles.scoreValue}>{item.score}</Text>
            <Text style={styles.scoreLabel}>points</Text>
          </View>
        </View>

        <View style={styles.scoreFooter}>
          <View style={styles.footerStat}>
            <Text style={styles.footerStatEmoji}>🎯</Text>
            <Text style={styles.footerStatText}>{item.matchesFound} matches</Text>
          </View>
          <View style={styles.footerStat}>
            <Text style={styles.footerStatEmoji}>⏱️</Text>
            <Text style={styles.footerStatText}>{formatTime(item.timePlayed)}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const LevelFilterButton = ({ level, label }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === level && styles.filterButtonActive]}
      onPress={() => setFilter(level)}
    >
      <Text style={[styles.filterButtonText, filter === level && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      </LinearGradient>
    );
  }

  const uniqueLevels = [...new Set(highScores.map(s => s.levelNumber))].sort((a, b) => a - b);

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 High Scores 🏆</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </LinearGradient>
          
          <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{completedLevels}/100</Text>
            <Text style={styles.statLabel}>Levels Completed</Text>
          </LinearGradient>
          
          <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </LinearGradient>
          
          <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.statCard}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statValue}>{highScores.length}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </LinearGradient>
        </View>

        {/* Top 10 Leaderboard */}
        {topScores.length > 0 && (
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>🏅 Top 10 Leaderboard</Text>
            <FlatList
              data={topScores}
              renderItem={renderTopScoreItem}
              keyExtractor={(item, index) => `top_${item.id}_${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.topListContainer}
            />
          </View>
        )}

        {/* Filter Section */}
        {uniqueLevels.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>🎮 Filter by Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <LevelFilterButton level="all" label="All Levels" />
              {uniqueLevels.map(level => (
                <LevelFilterButton key={level} level={level.toString()} label={`Level ${level}`} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Game Sessions */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            {filter === 'all' ? '📜 All Game Sessions' : `📜 Level ${filter} Sessions`}
          </Text>
          <Text style={styles.sessionCount}>
            {filteredScores.length} {filteredScores.length === 1 ? 'session' : 'sessions'}
          </Text>
          
          {filteredScores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎮</Text>
              <Text style={styles.emptyText}>No game sessions found</Text>
              <Text style={styles.emptySubtext}>Play some levels to see your scores!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredScores}
              renderItem={renderScoreItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.sessionsList}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.medium,
  },
  backButton: {
    padding: spacing.small,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: spacing.medium,
  },
  backButtonText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    fontWeight: '600',
  },
  placeholder: {
    width: 70,
  },
  headerTitle: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    marginTop: spacing.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: spacing.medium,
    gap: spacing.small,
  },
  statCard: {
    width: '22%',
    alignItems: 'center',
    padding: spacing.small,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: fontSizes.xsmall,
    color: candyTheme.textLight,
    marginTop: 2,
    opacity: 0.9,
    textAlign: 'center',
  },
  leaderboardSection: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    marginBottom: spacing.medium,
    paddingLeft: spacing.small,
  },
  topListContainer: {
    gap: spacing.small,
  },
  topScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRankContainer: {
    width: 50,
    alignItems: 'center',
  },
  topRank: {
    fontSize: 32,
  },
  topScoreDetails: {
    flex: 1,
    marginLeft: spacing.small,
  },
  topPlayerName: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textDark,
  },
  topLevelText: {
    fontSize: fontSizes.xsmall,
    color: '#666',
    marginTop: 2,
  },
  topStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  topScore: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textDark,
  },
  topStars: {
    fontSize: 12,
  },
  filterSection: {
    marginTop: spacing.large,
    paddingHorizontal: spacing.medium,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
  },
  filterButtonText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
  },
  filterButtonTextActive: {
    color: candyTheme.textDark,
    fontWeight: 'bold',
  },
  sessionsSection: {
    marginTop: spacing.large,
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.xlarge,
  },
  sessionCount: {
    fontSize: fontSizes.xsmall,
    color: candyTheme.textLight,
    opacity: 0.8,
    marginBottom: spacing.medium,
    paddingLeft: spacing.small,
  },
  sessionsList: {
    gap: spacing.small,
  },
  scoreCard: {
    borderRadius: 15,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  levelBadge: {
    alignItems: 'center',
  },
  levelBadgeText: {
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: fontSizes.xsmall,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateText: {
    fontSize: fontSizes.xsmall,
    color: '#999',
  },
  scoreMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  scoreLeft: {
    flex: 1,
  },
  playerName: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textDark,
    marginBottom: 4,
  },
  starsContainer: {
    marginTop: 2,
  },
  starsText: {
    fontSize: 12,
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  scoreLabel: {
    fontSize: fontSizes.xsmall,
    color: '#999',
    marginTop: 2,
  },
  scoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.small,
    paddingTop: spacing.small,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerStatEmoji: {
    fontSize: 14,
  },
  footerStatText: {
    fontSize: fontSizes.xsmall,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xlarge,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: spacing.medium,
  },
  emptyText: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    opacity: 0.8,
    textAlign: 'center',
  },
});