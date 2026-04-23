import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const { width } = Dimensions.get('window');
const CANDIES = ['🍬', '🍭', '🍫', '🍪', '🍩'];

export default function CandyRushGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_rush' } = route.params || {};
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [currentCandy, setCurrentCandy] = useState(CANDIES[0]);
  const [targetCandy, setTargetCandy] = useState(CANDIES[1]);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          const stars = score > 80 ? 3 : score > 40 ? 2 : 1;
          saveGameProgress(gameId, levelNumber, stars, score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const candyTimer = setInterval(() => {
      setCurrentCandy(CANDIES[Math.floor(Math.random() * CANDIES.length)]);
    }, 800);
    
    return () => {
      clearInterval(timer);
      clearInterval(candyTimer);
    };
  }, [score]);

  const handleTap = (candy) => {
    if (candy === targetCandy) {
      setScore(prev => prev + 10);
      setTargetCandy(CANDIES[Math.floor(Math.random() * CANDIES.length)]);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  if (!gameActive) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <Text style={styles.title}>🎮 Game Over! 🎮</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Button title="Play Again" onPress={() => navigation.replace('GameLauncher', { gameId })} />
        <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.scoreText}>⭐ Score: {score}</Text>
        <Text style={styles.timer}>⚡ Time: {timeLeft}s</Text>
      </View>
      
      <Text style={styles.instruction}>Tap the {targetCandy} candy!</Text>
      
      <View style={styles.candyGrid}>
        {CANDIES.map(candy => (
          <TouchableOpacity
            key={candy}
            style={styles.candyButton}
            onPress={() => handleTap(candy)}
          >
            <Text style={styles.candyEmoji}>{candy}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.medium, marginTop: 40 },
  scoreText: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  timer: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  instruction: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, textAlign: 'center', marginVertical: spacing.large },
  candyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xlarge },
  candyButton: { padding: spacing.large, margin: spacing.medium, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 60 },
  candyEmoji: { fontSize: 60 },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, textAlign: 'center', marginTop: 100 },
  score: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, textAlign: 'center', marginVertical: spacing.large },
});