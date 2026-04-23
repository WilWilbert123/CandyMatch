import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const CANDIES = ['🍬', '🍭', '🍫', '🍪'];

export default function CandyMemoryGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_memory' } = route.params || {};
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [round, setRound] = useState(1);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const newSequence = [...sequence];
    newSequence.push(CANDIES[Math.floor(Math.random() * CANDIES.length)]);
    setSequence(newSequence);
    setUserInput([]);
    setShowSequence(true);
    setTimeout(() => setShowSequence(false), 2000);
  };

  const handleCandyPress = (candy) => {
    if (showSequence) return;
    
    const newInput = [...userInput, candy];
    setUserInput(newInput);
    
    if (sequence[newInput.length - 1] !== candy) {
      const stars = round > 3 ? 3 : round > 1 ? 2 : 1;
      saveGameProgress(gameId, levelNumber, stars, score);
      setGameActive(false);
      return;
    }
    
    if (newInput.length === sequence.length) {
      setScore(prev => prev + 20);
      setRound(prev => prev + 1);
      startRound();
    }
  };

  if (!gameActive) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <Text style={styles.title}>🎮 Game Over! 🎮</Text>
        <Text style={styles.score}>Round: {round}</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Button title="Play Again" onPress={() => navigation.replace('GameLauncher', { gameId })} />
        <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <Text style={styles.title}>🧠 Candy Memory</Text>
      <Text style={styles.level}>Round {round}</Text>
      <Text style={styles.score}>⭐ Score: {score}</Text>
      
      <Text style={styles.instruction}>
        {showSequence ? 'Watch the sequence...' : 'Repeat the sequence!'}
      </Text>
      
      {showSequence && (
        <View style={styles.sequenceContainer}>
          {sequence.map((candy, i) => (
            <Text key={i} style={styles.sequenceCandy}>{candy}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.candyGrid}>
        {CANDIES.map(candy => (
          <TouchableOpacity
            key={candy}
            style={styles.candyButton}
            onPress={() => handleCandyPress(candy)}
            disabled={showSequence}
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
  container: { flex: 1, alignItems: 'center', padding: spacing.large },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, marginTop: 40 },
  level: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, marginVertical: spacing.small },
  score: { fontSize: fontSizes.body, color: candyTheme.textLight },
  instruction: { fontSize: fontSizes.body, color: candyTheme.textLight, marginVertical: spacing.large },
  sequenceContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.3)', padding: spacing.large, borderRadius: 20, marginVertical: spacing.large },
  sequenceCandy: { fontSize: 40, marginHorizontal: spacing.small },
  candyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: spacing.large },
  candyButton: { padding: spacing.medium, margin: spacing.small, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
  candyEmoji: { fontSize: 50 },
});