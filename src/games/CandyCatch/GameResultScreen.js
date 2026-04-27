// src/games/CandyCatch/GameResultScreen.js
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

export default function GameResultScreen({ navigation, route }) {
  const { score, targetScore, stars, levelNumber, gameId, isWin } = route.params;
  
  const winSoundRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);

  const nextLevel = levelNumber + 1;
  const isNextLevelUnlocked = score >= targetScore * 0.7;

  // Load and play sound when component mounts
  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (isWin) {
          // Load win sound
          const { sound: winSound } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/win.mp3')
          );
          winSoundRef.current = winSound;
          setSoundReady(true);
          
          // Play the sound
          await winSound.playAsync();
        }
      } catch (error) {
        console.log('Error playing result sound:', error);
      }
    };

    loadAndPlaySound();

    // Cleanup sounds on unmount
    return () => {
      if (winSoundRef.current) {
        try {
          winSoundRef.current.unloadAsync();
        } catch (error) {}
      }
    };
  }, [isWin]);

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

        <View style={styles.buttonContainer}>
          {isNextLevelUnlocked && nextLevel <= 50 && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.replace('CandyCatch', { levelNumber: nextLevel, gameId })}
            >
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Next Level {nextLevel} →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.replayButton}
            onPress={() => navigation.replace('CandyCatch', { levelNumber, gameId })}
          >
            <Text style={styles.replayText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.levelSelectButton}
            onPress={() => navigation.navigate('CandyCatchLevelSelect', { gameId })}
          >
            <Text style={styles.levelSelectText}>Level Select</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.large },
  title: { fontSize: fontSizes.title + 4, fontWeight: 'bold', color: candyTheme.textLight, marginBottom: spacing.xlarge },
  scoreContainer: { alignItems: 'center', marginBottom: spacing.large },
  scoreLabel: { fontSize: fontSizes.body, color: candyTheme.textLight, opacity: 0.8 },
  score: { fontSize: 72, fontWeight: 'bold', color: '#FFD700', marginVertical: spacing.small },
  target: { fontSize: fontSizes.body, color: candyTheme.textLight },
  starsContainer: { flexDirection: 'row', marginBottom: spacing.xlarge },
  star: { fontSize: 48, marginHorizontal: spacing.small },
  buttonContainer: { width: '100%', gap: spacing.medium },
  nextButton: { borderRadius: 15, overflow: 'hidden' },
  buttonGradient: { padding: spacing.medium, alignItems: 'center' },
  buttonText: { fontSize: fontSizes.body, fontWeight: 'bold', color: '#fff' },
  replayButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: spacing.medium, borderRadius: 15, alignItems: 'center' },
  replayText: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  levelSelectButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: spacing.medium, borderRadius: 15, alignItems: 'center' },
  levelSelectText: { fontSize: fontSizes.body, color: candyTheme.textLight },
});