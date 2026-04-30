// src/games/CandyMemory/GameResultScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

export default function CandyMemoryResultScreen({ navigation, route }) {
  const { score, targetScore, stars, levelNumber, isWin } = route.params;

  const nextLevel = levelNumber + 1;
  const isNextLevelUnlocked = score >= targetScore * 0.7;

  const handlePlayAgain = () => {
    navigation.replace('CandyMemory', { 
      levelNumber: levelNumber, 
      gameId: 'candy_memory' 
    });
  };

  const handleNextLevel = () => {
    navigation.replace('CandyMemory', { 
      levelNumber: nextLevel, 
      gameId: 'candy_memory' 
    });
  };

  const handleLevelSelect = () => {
    navigation.navigate('CandyMemoryLevelSelect', { 
      gameId: 'candy_memory' 
    });
  };

  const handleGameHub = () => {
    navigation.navigate('GameHub');
  };

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isWin ? '🎉 VICTORY! 🎉' : '😢 TRY AGAIN! 😢'}</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.target}>Target: {targetScore}</Text>
        </View>

        <View style={styles.starsContainer}>
          {[1, 2, 3].map(star => (
            <Text key={star} style={styles.star}>
              {star <= stars ? '⭐' : '☆'}
            </Text>
          ))}
        </View>

        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>🧠 Candy Memory</Text>
          <Text style={styles.levelText}>Level {levelNumber}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {isWin && isNextLevelUnlocked && nextLevel <= 50 && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextLevel}>
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Next Level {nextLevel} →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.replayButton} onPress={handlePlayAgain}>
            <LinearGradient colors={['#4ECDC4', '#44B3AA']} style={styles.replayGradient}>
              <Text style={styles.replayText}>🔄 Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.levelSelectButton} onPress={handleLevelSelect}>
            <LinearGradient colors={['#9B59B6', '#8E44AD']} style={styles.levelSelectGradient}>
              <Text style={styles.levelSelectText}>🗂️ Level Select</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gameHubButton} onPress={handleGameHub}>
            <LinearGradient colors={['#3498DB', '#2980B9']} style={styles.gameHubGradient}>
              <Text style={styles.gameHubText}>🏠 Game Hub</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {!isWin && (
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>💪 Practice makes perfect! Try again! 💪</Text>
          </View>
        )}

        {isWin && stars === 3 && (
          <View style={styles.perfectContainer}>
            <Text style={styles.perfectText}>🏆 PERFECT MEMORY! 🏆</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: spacing.large 
  },
  title: { 
    fontSize: fontSizes.title + 4, 
    fontWeight: 'bold', 
    color: candyTheme.textLight, 
    marginBottom: spacing.xlarge,
    textAlign: 'center',
  },
  scoreContainer: { 
    alignItems: 'center', 
    marginBottom: spacing.large 
  },
  scoreLabel: { 
    fontSize: fontSizes.body, 
    color: candyTheme.textLight, 
    opacity: 0.8 
  },
  score: { 
    fontSize: 72, 
    fontWeight: 'bold', 
    color: '#FFD700', 
    marginVertical: spacing.small,
  },
  target: { 
    fontSize: fontSizes.body, 
    color: candyTheme.textLight 
  },
  starsContainer: { 
    flexDirection: 'row', 
    marginBottom: spacing.large 
  },
  star: { 
    fontSize: 48, 
    marginHorizontal: spacing.small 
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: spacing.xlarge,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    borderRadius: 20,
  },
  gameName: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    marginBottom: 4,
  },
  levelText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    opacity: 0.8,
  },
  buttonContainer: { 
    width: '100%', 
    gap: spacing.medium 
  },
  nextButton: { 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  buttonGradient: { 
    padding: spacing.medium, 
    alignItems: 'center' 
  },
  buttonText: { 
    fontSize: fontSizes.body, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  replayButton: { 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  replayGradient: { 
    padding: spacing.medium, 
    alignItems: 'center' 
  },
  replayText: { 
    fontSize: fontSizes.body, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  levelSelectButton: { 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  levelSelectGradient: { 
    padding: spacing.medium, 
    alignItems: 'center' 
  },
  levelSelectText: { 
    fontSize: fontSizes.body, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  gameHubButton: { 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  gameHubGradient: { 
    padding: spacing.medium, 
    alignItems: 'center' 
  },
  gameHubText: { 
    fontSize: fontSizes.body, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  encouragementContainer: {
    marginTop: spacing.large,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.medium,
    borderRadius: 15,
    maxWidth: '90%',
  },
  encouragementText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    textAlign: 'center',
    fontWeight: '600',
  },
  perfectContainer: {
    marginTop: spacing.large,
    backgroundColor: 'rgba(255,215,0,0.3)',
    padding: spacing.medium,
    borderRadius: 15,
  },
  perfectText: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
});