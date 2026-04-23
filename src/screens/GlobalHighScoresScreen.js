import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { spacing } from '../styles/theme';
import {
    getAllGamesSessions,
    getGlobalTopScores
} from '../utils/storage';

const { width, height } = Dimensions.get('window');

const GAME_ICONS = {
  candy_match: { emoji: '🍬', name: 'Candy Match', color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E53'] },
  candy_catch: { emoji: '🍭', name: 'Candy Catch', color: '#FF69B4', gradient: ['#FF69B4', '#FF1493'] },
  candy_sort: { emoji: '🍫', name: 'Candy Sort', color: '#F1C40F', gradient: ['#F1C40F', '#F39C12'] },
  candy_memory: { emoji: '🧠', name: 'Candy Memory', color: '#9B59B6', gradient: ['#9B59B6', '#8E44AD'] },
  candy_pop: { emoji: '🎈', name: 'Candy Pop', color: '#E74C3C', gradient: ['#E74C3C', '#C0392B'] },
  candy_count: { emoji: '🔢', name: 'Candy Count', color: '#3498DB', gradient: ['#3498DB', '#2980B9'] },
  candy_color: { emoji: '🎨', name: 'Candy Color', color: '#2ECC71', gradient: ['#2ECC71', '#27AE60'] },
  candy_puzzle: { emoji: '🧩', name: 'Candy Puzzle', color: '#2ECC71', gradient: ['#2ECC71', '#27AE60'] },
  candy_rush: { emoji: '⚡', name: 'Candy Rush', color: '#F1C40F', gradient: ['#F1C40F', '#F39C12'] },
  candy_bingo: { emoji: '🎲', name: 'Candy Bingo', color: '#9B59B6', gradient: ['#9B59B6', '#8E44AD'] },
};

// Animated Score Card Component
const AnimatedScoreCard = ({ item, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(50)).current;
  const gameInfo = GAME_ICONS[item.gameId] || GAME_ICONS.candy_match;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateXAnim, {
        toValue: 0,
        delay: index * 50,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getMedal = () => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getMedalStyle = () => {
    if (index === 0) return styles.goldGlow;
    if (index === 1) return styles.silverGlow;
    if (index === 2) return styles.bronzeGlow;
    return {};
  };

  return (
    <Animated.View
      style={[
        styles.scoreCardWrapper,
        {
          opacity: scaleAnim,
          transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={index < 3 ? ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
          style={[styles.scoreCard, index < 3 && styles.topScoreCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {index < 3 && <View style={[styles.glowEffect, getMedalStyle()]} />}
          
          <View style={[styles.rankBadge, index < 3 && styles.topRankBadge]}>
            <Text style={[styles.rankText, index < 3 && styles.topRankText]}>
              {getMedal()}
            </Text>
          </View>

          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>{gameInfo.emoji}</Text>
          </View>

          <View style={styles.scoreInfoContainer}>
            <Text style={styles.playerName}>{item.childName}</Text>
            <Text style={styles.gameName}>{gameInfo.name} • Level {item.levelNumber}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statChipEmoji}>🎯</Text>
                <Text style={styles.statChipText}>{item.score} pts</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statChipEmoji}>⭐</Text>
                <Text style={styles.statChipText}>{'⭐'.repeat(item.starsEarned)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="#FFD700" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Particle Background Component
const ParticleBackground = () => {
  const [particlePositions, setParticlePositions] = useState([]);

  useEffect(() => {
    const positions = Array(30).fill().map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
    }));
    setParticlePositions(positions);
  }, []);

  return (
    <View style={styles.particleContainer}>
      {particlePositions.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function GlobalHighScoresScreen({ navigation }) {
  const [allScores, setAllScores] = useState([]);
  const [globalTop, setGlobalTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allSessions = await getAllGamesSessions();
    const topGlobal = await getGlobalTopScores(50);
    
    setAllScores(allSessions);
    setGlobalTop(topGlobal);
    setLoading(false);
  };

  const getGameStats = (gameId) => {
    const scores = allScores.filter(s => s.gameId === gameId);
    return {
      count: scores.length,
      best: scores[0]?.score || 0,
    };
  };

  const filteredScores = selectedGame === 'all' 
    ? globalTop 
    : globalTop.filter(session => session.gameId === selectedGame);

  const totalGames = allScores.length;
  const totalStars = allScores.reduce((sum, s) => sum + s.starsEarned, 0);
  const averageScore = totalGames > 0 ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalGames) : 0;

  const GameFilterButton = ({ gameId, gameInfo, onPress, isActive }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const stats = getGameStats(gameId);
    const hasScores = stats.count > 0;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isActive ? gameInfo.gradient : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={[styles.filterButton, isActive && styles.filterButtonActive]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.filterEmoji}>{gameInfo.emoji}</Text>
            <Text style={[styles.filterName, isActive && styles.filterNameActive]}>
              {gameInfo.name}
            </Text>
            {hasScores && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{stats.best}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
      <ParticleBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
          style={styles.headerGradient}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEmoji}>🏆</Text>
            <Text style={styles.headerTitle}>Hall of Fame</Text>
            <Text style={styles.headerSubtitle}>Global Rankings</Text>
          </View>

          <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Stats Cards - NOW VISIBLE */}
      <View style={styles.statsContainer}>
        <LinearGradient colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']} style={styles.statCard}>
          <Text style={styles.statEmoji}>🎮</Text>
          <Text style={styles.statValue}>{totalGames}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </LinearGradient>
        <LinearGradient colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']} style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{totalStars}</Text>
          <Text style={styles.statLabel}>Stars</Text>
        </LinearGradient>
        <LinearGradient colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']} style={styles.statCard}>
          <Text style={styles.statEmoji}>📊</Text>
          <Text style={styles.statValue}>{averageScore}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </LinearGradient>
      </View>

      {/* Game Filters */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <GameFilterButton
            gameId="all"
            gameInfo={{ emoji: '🌍', name: 'All', gradient: ['#FFD700', '#FFA500'] }}
            onPress={() => setSelectedGame('all')}
            isActive={selectedGame === 'all'}
          />
          {Object.entries(GAME_ICONS).map(([id, info]) => (
            <GameFilterButton
              key={id}
              gameId={id}
              gameInfo={info}
              onPress={() => setSelectedGame(id)}
              isActive={selectedGame === id}
            />
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard List */}
      <Animated.FlatList
        data={filteredScores}
        renderItem={({ item, index }) => (
          <AnimatedScoreCard
            item={item}
            index={index}
            onPress={() => {}}
          />
        )}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyText}>No scores yet!</Text>
            <Text style={styles.emptySubtext}>Play some games to appear on the leaderboard</Text>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => navigation.navigate('GameHub')}
            >
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.playButtonGradient}>
                <Text style={styles.playButtonText}>Start Playing →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 2,
    opacity: 0.3,
  },
  header: {
    position: 'relative',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.large,
  },
  backButton: {
    padding: spacing.small,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    padding: spacing.small,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.medium,
    marginVertical: spacing.medium,
    gap: spacing.small,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  filterSection: {
    marginVertical: spacing.small,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.medium,
    gap: spacing.small,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 25,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterButtonActive: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  filterEmoji: {
    fontSize: 18,
  },
  filterName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterNameActive: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  filterBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: spacing.medium,
    paddingBottom: spacing.xlarge,
  },
  scoreCardWrapper: {
    marginBottom: spacing.small,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  topScoreCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  goldGlow: {
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  silverGlow: {
    backgroundColor: 'rgba(192,192,192,0.1)',
  },
  bronzeGlow: {
    backgroundColor: 'rgba(205,127,50,0.1)',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
  },
  topRankBadge: {
    backgroundColor: '#FFD700',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  topRankText: {
    fontSize: 28,
    color: '#FFF',
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.medium,
  },
  gameIcon: {
    fontSize: 40,
  },
  scoreInfoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  gameName: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statChipEmoji: {
    fontSize: 10,
  },
  statChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  arrowContainer: {
    width: 30,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: spacing.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xlarge,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  playButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  playButtonGradient: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});