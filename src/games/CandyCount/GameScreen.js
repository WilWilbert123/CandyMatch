// src/games/CandyCount/GameScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';
import { updateGameProgress } from '../../utils/storage';
import { useCandyCountLogic } from './useGameLogic';

export default function CandyCountGameScreen({ navigation, route }) {
  const { 
    levelNumber, 
    gameId = 'candy_count',
    timeLimit,
    targetScore 
  } = route.params;

  const {
    score,
    timeLeft,
    gameActive,
    currentNumber,
    options,
    combo,
    wrongAnswers,
    feedback,
    isGameComplete,
    starsEarned,
    targetScore: targetScoreValue,
    maxWrongAnswers,
    handleAnswer,
    toggleMusic,
    isMusicMuted,
  } = useCandyCountLogic(levelNumber, timeLimit, targetScore);

  // Handle game completion
  useEffect(() => {
    if (isGameComplete) {
      const isWin = score >= targetScoreValue;
      const stars = starsEarned;
      
      console.log('Game completed!', { isWin, score, stars, levelNumber });
      
      // Save progress and navigate
      const saveAndNavigate = async () => {
        try {
          await updateGameProgress(gameId, levelNumber, score, stars, isWin);
          console.log('Progress saved successfully');
        } catch (error) {
          console.error('Error saving progress:', error);
        }
        
        // Navigate to result screen
        navigation.replace('CandyCountResult', {
          score,
          targetScore: targetScoreValue,
          stars,
          levelNumber,
          isWin,
        });
      };
      
      saveAndNavigate();
    }
  }, [isGameComplete, score, targetScoreValue, starsEarned, levelNumber, gameId, navigation]);

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      {/* Game Header */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.targetValue}>/{targetScoreValue}</Text>
        </View>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>
        
        <TouchableOpacity onPress={toggleMusic} style={styles.musicButton}>
          <Text style={styles.musicIcon}>{isMusicMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* Combo and Wrong Answers */}
      <View style={styles.statsContainer}>
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>Combo: x{combo}</Text>
        </View>
        <View style={styles.wrongContainer}>
          <Text style={styles.wrongText}>Wrong: {wrongAnswers}/{maxWrongAnswers}</Text>
        </View>
      </View>

      {/* Main Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>How many candies?</Text>
        <View style={styles.numberDisplay}>
          <Text style={styles.numberText}>{currentNumber}</Text>
        </View>
      </View>

      {/* Feedback Message */}
      {feedback && (
        <View style={[styles.feedbackContainer, feedback.isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
            disabled={!gameActive}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.optionGradient}
            >
              <Text style={styles.optionText}>{option}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    paddingTop: spacing.xlarge,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.small,
    borderRadius: 10,
  },
  scoreLabel: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    marginRight: 4,
  },
  scoreValue: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  targetValue: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    marginLeft: 4,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.small,
    borderRadius: 10,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
  },
  timerValue: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  musicButton: {
    padding: spacing.small,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  musicIcon: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    marginTop: spacing.medium,
  },
  comboContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
  },
  comboText: {
    fontWeight: 'bold',
    color: candyTheme.textDark,
  },
  wrongContainer: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
  },
  wrongText: {
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  questionContainer: {
    alignItems: 'center',
    marginTop: spacing.xlarge,
    marginBottom: spacing.large,
  },
  questionText: {
    fontSize: fontSizes.subtitle,
    color: candyTheme.textLight,
    marginBottom: spacing.medium,
  },
  numberDisplay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.xlarge,
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  feedbackContainer: {
    marginHorizontal: spacing.medium,
    padding: spacing.medium,
    borderRadius: 10,
    marginBottom: spacing.medium,
  },
  correctFeedback: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
  },
  wrongFeedback: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
  },
  feedbackText: {
    fontSize: fontSizes.body,
    color: candyTheme.textLight,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: spacing.medium,
    gap: spacing.medium,
  },
  optionButton: {
    width: '45%',
    marginBottom: spacing.medium,
    borderRadius: 15,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: spacing.medium,
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: candyTheme.textDark,
  },
});