import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import ScoreDisplay from '../components/ScoreDisplay';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSound } from '../hooks/useSound';
import { candyTheme, spacing } from '../styles/theme';
import { saveGameSession, saveLevelProgress } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function GameScreen({ route, navigation }) {
  const { levelNumber = 1 } = route.params || {};
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
    isPreviewMode,  // ← ADD THIS
    initializeGame,
    handleCardPress,
  } = useGameLogic(levelNumber);

  const { playFlip, playMatch, playWin } = useSound();

  useEffect(() => {
    initializeGame();
  }, [levelNumber]);

  useEffect(() => {
    if (matchedIndices.length > 0 && matchedIndices.length % 2 === 0) {
      playMatch();
    }
  }, [matchedIndices, playMatch]);

  useEffect(() => {
    if (isGameComplete && starsEarned > 0) {
      playWin();
    }
  }, [isGameComplete, starsEarned, playWin]);

  useEffect(() => {
    if (isGameComplete && starsEarned > 0) {
      const timeSpent = levelConfig.timeLimit ? (levelConfig.timeLimit - (timeLeft || 0)) : 0;
      saveLevelProgress(levelNumber, starsEarned, score, moves, timeSpent);
      saveGameSession(score, matchedIndices.length / 2, timeSpent, 'Player', levelNumber, starsEarned);
      
      const starDisplay = '⭐'.repeat(starsEarned);
      const nextLevel = levelNumber + 1;
      
      Alert.alert(
        `🎉 Level ${levelNumber} Complete! 🎉`,
        `${starDisplay}\nScore: ${score}\nMoves: ${moves}\n\n${nextLevel <= 100 ? 'Next level unlocked!' : '🏆 You completed all 100 levels! 🏆'}`,
        [
          { text: 'Play Again', onPress: initializeGame },
          { text: 'Next Level', onPress: () => nextLevel <= 100 && navigation.replace('Game', { levelNumber: nextLevel }) },
          { text: 'Level Map', onPress: () => navigation.navigate('LevelSelect') },
        ]
      );
    }
  }, [isGameComplete, starsEarned]);

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

  return (
    <LinearGradient
      colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.levelHeader}>
        <Text style={styles.levelText}>Level {levelNumber}</Text>
        <Text style={styles.themeText}>{theme.name}</Text>
        {timeLeft !== null && (
          <Text style={[styles.timerText, timeLeft < 30 && styles.timerWarning]}>
            ⏱️ {formatTime(timeLeft)}
          </Text>
        )}
      </View>
      
      {/* ← ADD PREVIEW MODE INDICATOR */}
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
        <Button title="Map" onPress={() => navigation.navigate('LevelSelect')} />
      </View>
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
});