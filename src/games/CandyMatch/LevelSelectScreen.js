// src/screens/LevelSelectScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';
import { getLevelStars, getUnlockedLevels } from '../../utils/storage';
import { LEVELS } from './levels';

export default function LevelSelectScreen({ navigation, route }) {
  const { gameId = 'candy_match' } = route.params || {}; // Get gameId from params
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [levelStars, setLevelStars] = useState({});
  const [loading, setLoading] = useState(true);

  // Create worlds (20 levels per world)
  const worlds = [];
  for (let i = 0; i < 100; i += 20) {
    worlds.push({
      id: i / 20 + 1,
      levels: LEVELS.slice(i, i + 20),
      startLevel: i + 1,
      endLevel: Math.min(i + 20, 100)
    });
  }

  const currentWorld = worlds[selectedWorld - 1];

  useEffect(() => {
    loadData();
  }, [gameId]); // Reload when gameId changes

  const loadData = async () => {
    setLoading(true);
    try {
      // Pass gameId to storage functions
      const unlocked = await getUnlockedLevels(gameId);
      setUnlockedLevels(unlocked);

      const stars = {};
      for (let i = 1; i <= 100; i++) {
        stars[i] = await getLevelStars(gameId, i); // Pass gameId
      }
      setLevelStars(stars);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLevel = ({ item: level }) => {
    if (!level) return null;

    const isUnlocked = unlockedLevels.includes(level.levelNumber);
    const stars = levelStars[level.levelNumber] || 0;

    return (
      <TouchableOpacity
        style={[styles.levelCard, !isUnlocked && styles.levelLocked]}
        onPress={() => {
          if (isUnlocked) {
            navigation.navigate('CandyMatch', { 
              levelNumber: level.levelNumber, 
              gameId: gameId 
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
          <Text style={styles.starsText}>
            {stars === 3 ? '🌟🌟🌟' : stars === 2 ? '🌟🌟' : stars === 1 ? '🌟' : '☆☆☆'}
          </Text>
          {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level Select</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.worldSelector}
        contentContainerStyle={styles.worldSelectorContent}
      >
        {worlds.map(world => (
          <TouchableOpacity
            key={world.id}
            style={[
              styles.worldButton,
              selectedWorld === world.id && styles.worldButtonActive
            ]}
            onPress={() => setSelectedWorld(world.id)}
          >
            <Text style={[styles.worldText, selectedWorld === world.id && styles.worldTextActive]}>
              World {world.id}
            </Text>
            <Text style={[styles.worldLevels, selectedWorld === world.id && styles.worldLevelsActive]}>
              {world.startLevel}-{world.endLevel}
            </Text>
            <Text style={styles.bigStar}>
              {selectedWorld === world.id ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={currentWorld?.levels || []}
        renderItem={renderLevel}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        numColumns={4}
        contentContainerStyle={styles.levelGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No levels available</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
    paddingBottom: spacing.medium,
  },
  backButton: {
    padding: spacing.small,
  },
  backButtonText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textAlign: 'center',
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
  },
  worldButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.small,
    marginHorizontal: spacing.small,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  worldButtonActive: {
    backgroundColor: candyTheme.candyYellow,
    borderColor: '#FFF',
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
  },
  worldLevelsActive: {
    color: candyTheme.textDark,
  },
  levelGrid: {
    padding: spacing.medium,
    alignItems: 'center',
  },
  levelCard: {
    width: 70,
    height: 80,
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
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  starsText: {
    fontSize: 10,
    marginTop: 4,
    color: candyTheme.textLight,
  },
  lockIcon: {
    fontSize: 20,
    marginTop: 4,
    color: candyTheme.textLight,
  },
  bigStar: {
    fontSize: 26,
    marginTop: 6,
    textAlign: 'center',
    color: '#FFD700',
  },
});