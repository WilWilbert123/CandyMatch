import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

export default function CandyCountGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_count' } = route.params || {};
  const [score, setScore] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(3);
  const [options, setOptions] = useState([2, 3, 4, 5]);
  const [gameActive, setGameActive] = useState(true);

  const generateQuestion = () => {
    const num = Math.floor(Math.random() * 5) + 1;
    setCurrentNumber(num);
    const wrong1 = num + 1 > 5 ? num - 1 : num + 1;
    const wrong2 = num + 2 > 5 ? num - 2 : num + 2;
    const newOptions = [num, wrong1, wrong2, Math.floor(Math.random() * 5) + 1];
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (answer) => {
    if (answer === currentNumber) {
      const newScore = score + 10;
      setScore(newScore);
      generateQuestion();
      
      if (newScore >= levelNumber * 50) {
        saveGameProgress(gameId, levelNumber, 3, newScore);
        setGameActive(false);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  if (!gameActive) {
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <Text style={styles.title}>🎉 Level Complete! 🎉</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Button title="Next Level" onPress={() => navigation.replace('GameLauncher', { gameId })} />
        <Button title="← Game Hub" onPress={() => navigation.navigate('GameHub')} variant="secondary" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <Text style={styles.title}>🔢 Candy Count</Text>
      <Text style={styles.level}>Level {levelNumber}</Text>
      <Text style={styles.score}>⭐ Score: {score}</Text>
      
      <Text style={styles.question}>How many candies?</Text>
      <View style={styles.candiesRow}>
        {[...Array(currentNumber)].map((_, i) => (
          <Text key={i} style={styles.candyEmoji}>🍬</Text>
        ))}
      </View>
      
      <View style={styles.optionsRow}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
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
  score: { fontSize: fontSizes.body, color: candyTheme.textLight, marginVertical: spacing.small },
  question: { fontSize: fontSizes.subtitle, color: candyTheme.textLight, marginVertical: spacing.large },
  candiesRow: { flexDirection: 'row', marginVertical: spacing.large },
  candyEmoji: { fontSize: 40, marginHorizontal: 4 },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginVertical: spacing.large },
  optionButton: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 35, justifyContent: 'center', alignItems: 'center', margin: spacing.small },
  optionText: { fontSize: 28, fontWeight: 'bold', color: candyTheme.textLight },
});