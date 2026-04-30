// src/games/CandySort/LevelSelectScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

// Generate Candy Sort levels (50 levels)
const generateLevels = () => {
  const levels = [];
  for (let i = 1; i <= 50; i++) {
    levels.push({
      id: i,
      levelNumber: i,
      timeLimit: Math.max(30, 60 - Math.floor(i / 2)),
      targetScore: 50 + (i * 10),
      requiredScore: 50 + (i * 10),
    });
  }
  return levels;
};

const LEVELS = generateLevels();

// Group levels into worlds (10 levels per world)
const WORLDS = [];
for (let i = 0; i < LEVELS.length; i += 10) {
  WORLDS.push({
    id: i / 10 + 1,
    levels: LEVELS.slice(i, i + 10),
    startLevel: i + 1,
    endLevel: Math.min(i + 10, LEVELS.length),
    name: `World ${i / 10 + 1}`,
    emoji: ['🍭', '🍬', '🍫', '🍪', '🍩', '🍰', '🧁', '🍦', '🍨', '🎂'][Math.floor(i / 10)],
  });
}

export default function LevelSelectScreen({ navigation, route }) {
  const { gameId = 'candy_sort' } = route.params || {};
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [levelStars, setLevelStars] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState(1);

  const currentWorld = WORLDS[selectedWorld - 1];

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const progress = await getGameProgress(gameId);
      
      const completedLevels = progress.completedLevels || [];
      const unlocked = [1];
      
      for (let i = 1; i <= 50; i++) {
        if (completedLevels.includes(i)) {
          if (!unlocked.includes(i)) unlocked.push(i);
          if (i + 1 <= 50 && !unlocked.includes(i + 1)) {
            unlocked.push(i + 1);
          }
        }
      }
      
      setUnlockedLevels(unlocked);
      
      const stars = {};
      for (let i = 1; i <= LEVELS.length; i++) {
        stars[i] = progress.bestStars?.[i] || 0;
      }
      setLevelStars(stars);
      
      console.log('Loaded Candy Sort levels:', { unlocked, stars });
    } catch (error) {
      console.error('Error loading Candy Sort data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLevel = ({ item: level }) => {
    const isUnlocked = unlockedLevels.includes(level.levelNumber);
    const stars = levelStars[level.levelNumber] || 0;
    const isCompleted = stars > 0;

    return (
      <TouchableOpacity
        style={[styles.levelCard, !isUnlocked && styles.levelLocked]}
        onPress={() => {
          if (isUnlocked) {
            navigation.navigate('CandySort', { 
              levelNumber: level.levelNumber, 
              gameId: gameId,
              timeLimit: level.timeLimit,
              targetScore: level.targetScore,
            });
          }
        }}
        disabled={!isUnlocked}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isUnlocked ? [candyTheme.candyYellow, candyTheme.candyOrange] : ['#999', '#666']}
          style={styles.levelGradient}
        >
          <Text style={styles.levelNumber}>{level.levelNumber}</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.starIcon}>
              {stars >= 1 ? '⭐' : '☆'}
            </Text>
            <Text style={styles.starIcon}>
              {stars >= 2 ? '⭐' : '☆'}
            </Text>
            <Text style={styles.starIcon}>
              {stars >= 3 ? '⭐' : '☆'}
            </Text>
          </View>
          {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
          {isCompleted && !isUnlocked && (
            <Text style={styles.completedText}>✓</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderWorldButton = ({ item: world }) => (
    <TouchableOpacity
      style={[
        styles.worldButton,
        selectedWorld === world.id && styles.worldButtonActive
      ]}
      onPress={() => setSelectedWorld(world.id)}
    >
      <Text style={styles.worldEmoji}>{world.emoji}</Text>
      <Text style={[
        styles.worldText,
        selectedWorld === world.id && styles.worldTextActive
      ]}>
        World {world.id}
      </Text>
      <Text style={styles.worldLevels}>
        {world.startLevel}-{world.endLevel}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.titleEmoji}>🗂️</Text>
          <Text style={styles.title}>Candy Sort</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* World Selector - Horizontal Scroll */}
      <FlatList
        data={WORLDS}
        renderItem={renderWorldButton}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.worldSelector}
        contentContainerStyle={styles.worldSelectorContent}
      />

      {/* Level Grid */}
      <FlatList
        key={`world-${selectedWorld}`}
        data={currentWorld?.levels || []}
        renderItem={renderLevel}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        contentContainerStyle={styles.levelGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No levels available</Text>
          </View>
        }
      />

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎯 Target: {currentWorld?.levels[0]?.targetScore || 0} - {currentWorld?.levels[currentWorld?.levels?.length - 1]?.targetScore || 0}
        </Text>
        <Text style={styles.footerSubText}>
          ⭐ 3 Stars: Beat target score by 50%
        </Text>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.large,
    paddingBottom: spacing.medium,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backButton: {
    padding: spacing.small,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    fontWeight: '600',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  titleEmoji: {
    fontSize: fontSizes.title,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xlarge,
  },
  loadingText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    marginTop: spacing.medium,
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    textAlign: 'center',
  },
  worldSelector: {
    marginVertical: spacing.medium,
  },
  worldSelectorContent: {
    paddingHorizontal: spacing.medium,
    gap: spacing.small,
  },
  worldButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.small,
    marginHorizontal: spacing.small,
    borderRadius: 15,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  worldButtonActive: {
    backgroundColor: candyTheme.candyYellow,
    borderColor: '#FFF',
    transform: [{ scale: 1.05 }],
  },
  worldEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  worldText: {
    fontWeight: 'bold',
    color: candyTheme.textLight,
    fontSize: fontSizes.small,
  },
  worldTextActive: {
    color: candyTheme.textDark,
  },
  worldLevels: {
    fontSize: fontSizes.xsmall,
    color: candyTheme.textLight,
    marginTop: 2,
    opacity: 0.8,
  },
  levelGrid: {
    padding: spacing.medium,
    alignItems: 'center',
  },
  levelCard: {
    width: 70,
    height: 90,
    margin: spacing.small,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  levelLocked: {
    opacity: 0.5,
  },
  levelGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.small,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  starIcon: {
    fontSize: 10,
    color: '#FFD700',
  },
  lockIcon: {
    fontSize: 20,
    marginTop: 4,
    color: candyTheme.textLight,
  },
  completedText: {
    fontSize: 16,
    marginTop: 4,
    color: '#4CAF50',
  },
  footer: {
    padding: spacing.medium,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    fontWeight: 'bold',
  },
  footerSubText: {
    fontSize: fontSizes.xsmall,
    color: candyTheme.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
});