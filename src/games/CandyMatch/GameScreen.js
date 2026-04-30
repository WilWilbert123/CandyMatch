// src/games/CandyMatch/GameScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LevelCompleteModal from '../../components/LevelCompleteModal';
import ScoreDisplay from '../../components/ScoreDisplay';
import { useSound } from '../../hooks/useSound';
import { candyTheme, spacing } from '../../styles/theme';
import { saveGameSession, saveLevelProgress } from '../../utils/storage';
import { useGameLogic } from './useGameLogic';

const { width } = Dimensions.get('window');

export default function GameScreen({ route, navigation }) {
  const { levelNumber = 1, gameId = 'candy_match' } = route.params || {};
  const [showModal, setShowModal] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const {
    cards,
    flippedIndices,
    matchedIndices,
    score,
    moves,
    timeLeft,
    isGameComplete,
    starsEarned,
    levelConfig,
    theme,
    isPreviewMode,
    initializeGame,
    handleCardPress,
  } = useGameLogic(levelNumber);

  const { playFlip, playMatch, playWin } = useSound();

  useEffect(() => {
    initializeGame();
    setHasSaved(false);
  }, [levelNumber]);

  useEffect(() => {
    if (matchedIndices.length > 0 && matchedIndices.length % 2 === 0) {
      playMatch();
    }
  }, [matchedIndices, playMatch]);

  useEffect(() => {
    if (isGameComplete && starsEarned > 0) {
      playWin();
      setShowModal(true);
    }
  }, [isGameComplete, starsEarned, playWin]);

  // Save progress when game completes
  useEffect(() => {
    if (isGameComplete && starsEarned > 0 && showModal && !hasSaved) {
      const timeSpent = levelConfig.timeLimit ? (levelConfig.timeLimit - (timeLeft || 0)) : 0;
      saveLevelProgress(gameId, levelNumber, starsEarned, score, moves, timeSpent);
      saveGameSession(gameId, score, matchedIndices.length / 2, timeSpent, 'Player', levelNumber, starsEarned);
      setHasSaved(true);
    }
  }, [isGameComplete, starsEarned, showModal, hasSaved, gameId, levelNumber, levelConfig, timeLeft, score, moves, matchedIndices.length]);

  if (!levelConfig || !cards.length) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Loading Game...</Text>
        </View>
      </LinearGradient>
    );
  }

  const cardWidth = (width - spacing.medium * 2 - spacing.small * (levelConfig.gridCols - 1)) / levelConfig.gridCols;
  const cardHeight = cardWidth * 1.2;

  const renderCard = ({ item, index }) => (
    <View style={{ width: cardWidth, height: cardHeight, margin: spacing.small / 2 }}>
      <Card
        emoji={item.emoji}
        isFlipped={flippedIndices.includes(index) || matchedIndices.includes(index)}
        isMatched={matchedIndices.includes(index)}
        onPress={() => {
          playFlip();
          handleCardPress(index);
        }}
      />
    </View>
  );

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Modal handlers - FIXED navigation to use correct screen names
  const handlePlayAgain = () => {
    setShowModal(false);
    setHasSaved(false);
    initializeGame();
  };

  const handleNextLevel = () => {
    const nextLevel = levelNumber + 1;
    if (nextLevel <= 100) {
      setShowModal(false);
      setHasSaved(false);
      // FIXED: Navigate to 'CandyMatch' instead of 'Game'
      navigation.replace('CandyMatch', { levelNumber: nextLevel, gameId: gameId });
    }
  };

  const handleLevelMap = () => {
    setShowModal(false);
    // FIXED: Navigate to 'CandyMatchLevelSelect' instead of 'LevelSelect'
    navigation.navigate('CandyMatchLevelSelect', { gameId: gameId });
  };

  return (
    <LinearGradient
      colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.levelHeader}>
        <Text style={styles.levelText}>Level {levelNumber}</Text>
        <Text style={styles.themeText}>{theme?.name || 'Candy Match'}</Text>
        {timeLeft !== null && (
          <Text style={[styles.timerText, timeLeft < 30 && styles.timerWarning]}>
            ⏱️ {formatTime(timeLeft)}
          </Text>
        )}
      </View>
      
      {isPreviewMode && (
        <View style={styles.previewOverlay}>
          <Text style={styles.previewText}>🔍 Memorize the cards! 🔍</Text>
        </View>
      )}
      
      <ScoreDisplay 
        score={score} 
        matches={matchedIndices.length / 2} 
        moves={moves}
        timeLeft={timeLeft}
        totalPairs={levelConfig.pairsCount}
      />
      
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={levelConfig.gridCols}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Restart" onPress={initializeGame} variant="secondary" />
        <Button title="Map" onPress={() => navigation.navigate('CandyMatchLevelSelect', { gameId: gameId })} />
      </View>

      {/* Level Complete Modal */}
      <LevelCompleteModal
        visible={showModal}
        levelNumber={levelNumber}
        score={score}
        moves={moves}
        starsEarned={starsEarned}
        nextLevel={levelNumber + 1}
        onPlayAgain={handlePlayAgain}
        onNextLevel={handleNextLevel}
        onLevelMap={handleLevelMap}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.medium,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  themeText: {
    fontSize: 14,
    color: candyTheme.textLight,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  timerWarning: {
    color: candyTheme.candyRed,
  },
  previewOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.medium,
    margin: spacing.medium,
    borderRadius: 25,
    alignItems: 'center',
  },
  previewText: {
    color: candyTheme.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  grid: {
    padding: spacing.medium,
    alignItems: 'center',
    paddingBottom: spacing.xlarge,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
});