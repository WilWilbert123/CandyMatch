// src/screens/GameHubScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const GAMES = [
  {
    id: 'candy_match',
    name: 'Candy Match',
    description: 'Find matching candy pairs!',
    colors: ['#FF6B6B', '#FF8E8E'],
    levels: 100,
    icon: '🍬',
    emoji: '🍭',
    badge: '⭐',
    badgeColor: '#FFD700',
    navigateTo: 'CandyMatchLevelSelect', // Specific screen
  },
  {
    id: 'candy_catch',
    name: 'Candy Catch',
    description: 'Catch falling candies!',
    colors: ['#FF69B4', '#FFB6D9'],
    levels: 50,
    icon: '🧺',
    emoji: '🍫',
    badge: '⚡',
    badgeColor: '#FFA500',
    navigateTo: 'CandyCatchLevelSelect', // Specific screen
  },
  {
    id: 'candy_sort',
    name: 'Candy Sort',
    description: 'Sort candies by color!',
    colors: ['#FFD700', '#FFA500'],
    levels: 40,
    icon: '🗂️',
    emoji: '🌈',
    badge: '🧸',
    badgeColor: '#FF6B6B',
    navigateTo: 'CandySortLevelSelect', // Specific screen for Candy Sort
  },
  {
    id: 'candy_memory',
    name: 'Candy Memory',
    description: 'Remember the sequence!',
    colors: ['#9B59B6', '#BB8FCE'],
    levels: 80,
    icon: '🧠',
    emoji: '🎯',
    badge: '🏆',
    badgeColor: '#FFD700',
    navigateTo: 'GameLauncher', // Use GameLauncher for now
  },
  {
    id: 'candy_pop',
    name: 'Candy Pop',
    description: 'Pop candy balloons!',
    colors: ['#E74C3C', '#FF6B6B'],
    levels: 60,
    icon: '🎈',
    emoji: '💥',
    badge: '🎉',
    badgeColor: '#FF1493',
    navigateTo: 'GameLauncher',
  },
  {
    id: 'candy_count',
    name: 'Candy Count',
    description: 'Count the candies!',
    colors: ['#3498DB', '#5DADE2'],
    levels: 30,
    icon: '🔢',
    emoji: '📊',
    badge: '🔢',
    badgeColor: '#2ECC71',
    navigateTo: 'GameLauncher',
  },
  {
    id: 'candy_color',
    name: 'Candy Color',
    description: 'Match candy colors!',
    colors: ['#2ECC71', '#58D68D'],
    levels: 20,
    icon: '🎨',
    emoji: '🖍️',
    badge: '🎨',
    badgeColor: '#FF6B6B',
    navigateTo: 'GameLauncher',
  },
  {
    id: 'candy_puzzle',
    name: 'Candy Puzzle',
    description: 'Complete the puzzle!',
    colors: ['#1ABC9C', '#48C9B0'],
    levels: 50,
    icon: '🧩',
    emoji: '🔍',
    badge: '🧩',
    badgeColor: '#F39C12',
    navigateTo: 'GameLauncher',
  },
  {
    id: 'candy_rush',
    name: 'Candy Rush',
    description: 'Tap matching candies!',
    colors: ['#E67E22', '#F39C12'],
    levels: 70,
    icon: '⚡',
    emoji: '🚀',
    badge: '💨',
    badgeColor: '#FFD700',
    navigateTo: 'GameLauncher',
  },
  {
    id: 'candy_bingo',
    name: 'Candy Bingo',
    description: 'Match bingo candies!',
    colors: ['#8E44AD', '#AF7AC5'],
    levels: 40,
    icon: '🎲',
    emoji: '🎯',
    badge: '🎲',
    badgeColor: '#E74C3C',
    navigateTo: 'GameLauncher',
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.medium * 3) / 2;

export default function GameHubScreen({ navigation }) {
  const [gameStats, setGameStats] = useState({});
  const scaleAnimations = useRef(GAMES.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index) => {
    Animated.spring(scaleAnimations[index], {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 200,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleAnimations[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 200,
      bounciness: 12,
    }).start();
  };

  const handleGamePress = (game, index) => {
    if (Platform.OS === 'ios') {
      // You can add haptic feedback here if desired
    }

    console.log('Navigating to:', game.navigateTo, 'for game:', game.id);

    // Navigation based on the game's navigateTo property
    switch (game.navigateTo) {
      case 'CandyMatchLevelSelect':
        navigation.navigate('CandyMatchLevelSelect', { gameId: game.id });
        break;
      case 'CandyCatchLevelSelect':
        navigation.navigate('CandyCatchLevelSelect', { gameId: game.id });
        break;
      case 'CandySortLevelSelect':
        navigation.navigate('CandySortLevelSelect', { gameId: game.id });
        break;
      case 'GameLauncher':
      default:
        navigation.navigate('GameLauncher', { gameId: game.id });
        break;
    }
  };

  const renderGameCard = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.gameCardWrapper,
          {
            transform: [{ scale: scaleAnimations[index] }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={() => handlePressIn(index)}
          onPressOut={() => handlePressOut(index)}
          onPress={() => handleGamePress(item, index)}
          style={styles.touchable}
        >
          <LinearGradient
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gameGradient}
          >
            {/* Floating Badge */}
            <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>

            {/* Main Icon with Bounce Effect */}
            <View style={styles.iconContainer}>
              <Text style={styles.gameIcon}>{item.icon}</Text>
              <View style={styles.emojiParticle}>
                <Text style={styles.emojiSmall}>{item.emoji}</Text>
              </View>
            </View>

            {/* Game Name */}
            <Text style={styles.gameName}>{item.name}</Text>

            {/* Description */}
            <Text style={styles.gameDesc} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Level Indicator */}
            <View style={styles.levelContainer}>
              <View style={styles.levelBar}>
                <View
                  style={[
                    styles.levelFill,
                    { width: `${Math.min(100, (item.levels % 100) * 1)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{item.levels} Levels</Text>
            </View>

            {/* Play Button */}
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>✨ PLAY ✨</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const HeaderComponent = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#FFD700', '#FF8C00', '#FF1493']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.titleCandy}>🍬 Candy Game Hub 🍭</Text>
        <Text style={styles.subtitle}>Choose your favorite candy adventure!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{GAMES.length}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>
              {GAMES.reduce((sum, game) => sum + game.levels, 0)}
            </Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>🎮</Text>
            <Text style={styles.statLabel}>Play Now</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
      style={styles.container}
    >
      <FlatList
        data={GAMES}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={HeaderComponent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? spacing.large : spacing.medium,
  },
  header: {
    marginBottom: spacing.large,
    marginHorizontal: spacing.medium,
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerGradient: {
    padding: spacing.large,
    alignItems: 'center',
    borderRadius: 30,
  },
  titleCandy: {
    fontSize: fontSizes.title + 4,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontSize: fontSizes.body,
    color: '#FFF9E6',
    marginBottom: spacing.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.small,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: fontSizes.title - 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: fontSizes.small - 2,
    color: '#FFF9E6',
    fontWeight: '600',
    marginTop: 2,
  },
  grid: {
    padding: spacing.medium,
    paddingBottom: spacing.xlarge,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gameCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: spacing.medium,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  touchable: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gameGradient: {
    padding: spacing.medium,
    alignItems: 'center',
    minHeight: 250,
    borderRadius: 25,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    fontSize: 20,
  },
  iconContainer: {
    marginTop: spacing.medium,
    marginBottom: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIcon: {
    fontSize: 56,
    marginBottom: spacing.small,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emojiParticle: {
    position: 'absolute',
    bottom: -8,
    right: -15,
  },
  emojiSmall: {
    fontSize: 20,
    opacity: 0.9,
  },
  gameName: {
    fontSize: fontSizes.body + 2,
    fontWeight: '800',
    color: candyTheme.textLight,
    textAlign: 'center',
    marginBottom: spacing.small,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameDesc: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    textAlign: 'center',
    marginBottom: spacing.medium,
    opacity: 0.95,
    fontWeight: '500',
    paddingHorizontal: spacing.small,
  },
  levelContainer: {
    width: '100%',
    marginBottom: spacing.medium,
    alignItems: 'center',
  },
  levelBar: {
    width: '90%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.small,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSizes.small - 2,
    color: candyTheme.textLight,
    fontWeight: '700',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 30,
    marginTop: spacing.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  playButtonText: {
    fontSize: fontSizes.small,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});