import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const CANDIES = [
  { emoji: '🍬', color: '#FF69B4', type: 'pink' },
  { emoji: '🍭', color: '#9B59B6', type: 'purple' },
  { emoji: '🍫', color: '#8B4513', type: 'brown' },
  { emoji: '🍪', color: '#D2691E', type: 'brown' },
];

export default function CandySortGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_sort' } = route.params || {};
  const [score, setScore] = useState(0);
  const [currentCandy, setCurrentCandy] = useState(CANDIES[0]);
  const [targetType, setTargetType] = useState('pink');
  const [gameActive, setGameActive] = useState(true);

  const handleSort = (selectedType) => {
    if (selectedType === targetType) {
      const newScore = score + 10;
      setScore(newScore);
      setCurrentCandy(CANDIES[Math.floor(Math.random() * CANDIES.length)]);
      const types = ['pink', 'purple', 'brown'];
      setTargetType(types[Math.floor(Math.random() * types.length)]);
      
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
      <Text style={styles.title}>🗂️ Candy Sort</Text>
      <Text style={styles.level}>Level {levelNumber}</Text>
      <Text style={styles.score}>⭐ Score: {score}</Text>
      
      <Text style={styles.instruction}>Sort this candy into the {targetType} basket!</Text>
      
      <View style={styles.candyContainer}>
        <Text style={styles.candyEmoji}>{currentCandy.emoji}</Text>
      </View>
      
      <View style={styles.basketsRow}>
        {CANDIES.map(candy => (
          <TouchableOpacity
            key={candy.type}
            style={[styles.basket, { backgroundColor: candy.color + '40' }]}
            onPress={() => handleSort(candy.type)}
          >
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketText}>{candy.type}</Text>
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
  instruction: { fontSize: fontSizes.body, color: candyTheme.textLight, textAlign: 'center', marginVertical: spacing.large },
  candyContainer: { backgroundColor: 'rgba(255,255,255,0.3)', padding: spacing.xlarge, borderRadius: 100, marginVertical: spacing.large },
  candyEmoji: { fontSize: 80 },
  basketsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: spacing.large },
  basket: { alignItems: 'center', padding: spacing.medium, margin: spacing.small, borderRadius: 15, minWidth: 100 },
  basketEmoji: { fontSize: 40 },
  basketText: { fontSize: fontSizes.small, color: '#FFF', marginTop: spacing.small, fontWeight: 'bold' },
});