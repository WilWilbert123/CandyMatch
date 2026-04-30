// src/screens/GameLauncherScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

export default function GameLauncherScreen({ route, navigation }) {
  const { gameId } = route.params;
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [progress, setProgress] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);  

  // Get game info from the games list with proper screen mappings
  const GAMES = {
    candy_match: { 
      name: 'Candy Match', 
      emoji: '🍬', 
      levels: 100, 
      colors: ['#FF6B6B', '#4ECDC4'], 
      screen: 'CandyMatch',  // FIXED: Changed from 'Game' to 'CandyMatch'
      levelSelectScreen: 'CandyMatchLevelSelect'
    },
    candy_catch: { 
      name: 'Candy Catch', 
      emoji: '🍭', 
      levels: 50, 
      colors: ['#FF69B4', '#9B59B6'], 
      screen: 'CandyCatch',
      levelSelectScreen: 'CandyCatchLevelSelect'
    },
    candy_sort: { 
      name: 'Candy Sort', 
      emoji: '🍫', 
      levels: 40, 
      colors: ['#F1C40F', '#E67E22'], 
      screen: 'CandySort',
      levelSelectScreen: 'CandySortLevelSelect'
    },
    candy_memory: { 
      name: 'Candy Memory', 
      emoji: '🧠', 
      levels: 80, 
      colors: ['#9B59B6', '#E67E22'], 
      screen: 'CandyMemory',
      levelSelectScreen: 'CandyMemoryLevelSelect'
    },
    candy_pop: { 
      name: 'Candy Pop', 
      emoji: '🎈', 
      levels: 60, 
      colors: ['#E74C3C', '#FF6B6B'], 
      screen: 'CandyPop',
      levelSelectScreen: 'CandyPopLevelSelect'
    },
    candy_count: { 
      name: 'Candy Count', 
      emoji: '🔢', 
      levels: 30, 
      colors: ['#3498DB', '#2ECC71'], 
      screen: 'GameLauncher',
      levelSelectScreen: 'GameHub'
    },
    candy_color: { 
      name: 'Candy Color', 
      emoji: '🎨', 
      levels: 20, 
      colors: ['#2ECC71', '#3498DB'], 
      screen: 'GameLauncher',
      levelSelectScreen: 'GameHub'
    },
    candy_puzzle: { 
      name: 'Candy Puzzle', 
      emoji: '🧩', 
      levels: 50, 
      colors: ['#2ECC71', '#3498DB'], 
      screen: 'GameLauncher',
      levelSelectScreen: 'GameHub'
    },
    candy_rush: { 
      name: 'Candy Rush', 
      emoji: '⚡', 
      levels: 70, 
      colors: ['#F1C40F', '#E67E22'], 
      screen: 'GameLauncher',
      levelSelectScreen: 'GameHub'
    },
    candy_bingo: { 
      name: 'Candy Bingo', 
      emoji: '🎲', 
      levels: 40, 
      colors: ['#9B59B6', '#E74C3C'], 
      screen: 'GameLauncher',
      levelSelectScreen: 'GameHub'
    },
  };

  const game = GAMES[gameId] || GAMES.candy_match;

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const prog = await AsyncStorage.getItem(`game_progress_${gameId}`);
      setProgress(prog ? JSON.parse(prog) : { completedLevels: [], bestStars: {} });
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgress({ completedLevels: [], bestStars: {} });
    }
  };

  // Function to start the game
  const startGame = (levelNumber) => {
    // Navigate to the specific game screen with the level number
    navigation.navigate(game.screen, { levelNumber: levelNumber, gameId: gameId });
  };

  // Function to go to level select
  const goToLevelSelect = () => {
    navigation.navigate(game.levelSelectScreen, { gameId: gameId });
  };

  if (showLevelSelect) {
    const levelsPerPage = 20;
    const totalPages = Math.ceil(game.levels / levelsPerPage);
    const startLevel = currentPage * levelsPerPage + 1;
    const endLevel = Math.min(startLevel + levelsPerPage - 1, game.levels);
    const currentLevels = [];
    for (let i = startLevel; i <= endLevel; i++) {
      currentLevels.push(i);
    }

    return (
      <LinearGradient colors={game.colors} style={styles.container}>
        <Text style={styles.title}>{game.emoji} {game.name} {game.emoji}</Text>
        <Text style={styles.subtitle}>Choose a level to play!</Text>
        
        <ScrollView contentContainerStyle={styles.levelGrid}>
          {currentLevels.map(levelNum => {
            const isUnlocked = levelNum === 1 || progress?.completedLevels?.includes(levelNum - 1);
            const stars = progress?.bestStars?.[levelNum] || 0;
            
            return (
              <TouchableOpacity
                key={levelNum}
                style={[styles.levelButton, !isUnlocked && styles.levelLocked]}
                onPress={() => {
                  if (isUnlocked) {
                    startGame(levelNum);
                  }
                }}
                disabled={!isUnlocked}
              >
                <LinearGradient
                  colors={isUnlocked ? ['#F1C40F', '#E67E22'] : ['#999', '#666']}
                  style={styles.levelGradient}
                >
                  <Text style={styles.levelNumber}>{levelNum}</Text>
                  <Text style={styles.starsText}>
                    {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
         
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    padding: spacing.large 
  },
  title: { 
    fontSize: fontSizes.title, 
    fontWeight: 'bold', 
    color: candyTheme.textLight, 
    textAlign: 'center', 
    marginTop: spacing.large 
  },
  subtitle: { 
    fontSize: fontSizes.body, 
    color: candyTheme.textLight, 
    marginVertical: spacing.medium 
  },
  comingSoon: { 
    fontSize: fontSizes.subtitle, 
    color: candyTheme.textLight, 
    marginVertical: spacing.xlarge 
  },
  levelGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginVertical: spacing.large 
  },
  levelButton: { 
    width: 70, 
    height: 80, 
    margin: spacing.small, 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  levelLocked: { 
    opacity: 0.5 
  },
  levelGradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  levelNumber: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: candyTheme.textLight 
  },
  starsText: { 
    fontSize: 12, 
    marginTop: 4, 
    color: candyTheme.textLight 
  },
  pagination: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: spacing.medium 
  },
  pageText: { 
    fontSize: fontSizes.body, 
    color: candyTheme.textLight, 
    marginHorizontal: spacing.medium 
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginTop: spacing.medium,
  },
});