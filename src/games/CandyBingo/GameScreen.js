import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const { width } = Dimensions.get('window');

export default function CandyBingoGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_bingo' } = route.params || {};
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    // Game logic here
  }, []);

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
      <Text style={styles.title}>🎲 Candy Bingo</Text>
      <Text style={styles.score}>Level {levelNumber}</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <Button title="Complete Level" onPress={() => {
        saveGameProgress(gameId, levelNumber, 3, score + 100);
        setGameActive(false);
      }} />
      <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: spacing.large },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, marginTop: 100 },
  score: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, marginVertical: spacing.large },
});