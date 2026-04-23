import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

export default function CandyPopGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_pop' } = route.params || {};
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [balloons, setBalloons] = useState([]);

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
    
    const spawnTimer = setInterval(() => {
      if (gameActive) {
        setBalloons(prev => [...prev, { id: Date.now(), x: Math.random() * (width - 80) }]);
        setTimeout(() => {
          setBalloons(prev => prev.filter(b => b.id !== Date.now()));
        }, 3000);
      }
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(spawnTimer);
    };
  }, [gameActive, score]);

  const popBalloon = (id) => {
    setScore(prev => prev + 10);
    setBalloons(prev => prev.filter(b => b.id !== id));
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
        <Text style={styles.timer}>⏱️ Time: {timeLeft}s</Text>
      </View>
      
      <Text style={styles.instruction}>Pop the candy balloons!</Text>
      
      {balloons.map(balloon => (
        <TouchableOpacity
          key={balloon.id}
          style={[styles.balloon, { left: balloon.x, top: 100 + Math.random() * 200 }]}
          onPress={() => popBalloon(balloon.id)}
        >
          <Text style={styles.balloonEmoji}>🎈🍬</Text>
        </TouchableOpacity>
      ))}
      
      <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" style={styles.hubButton} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.medium },
  scoreText: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  timer: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  instruction: { fontSize: fontSizes.body, color: candyTheme.textLight, textAlign: 'center', marginVertical: spacing.large },
  balloon: { position: 'absolute' },
  balloonEmoji: { fontSize: 50 },
  hubButton: { position: 'absolute', bottom: 20, alignSelf: 'center' },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, textAlign: 'center', marginTop: 100 },
  score: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, textAlign: 'center', marginVertical: spacing.large },
});