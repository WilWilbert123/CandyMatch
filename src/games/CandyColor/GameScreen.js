import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const COLORS = [
  { name: 'Red', color: '#E74C3C', emoji: '🍎' },
  { name: 'Blue', color: '#3498DB', emoji: '🫐' },
  { name: 'Green', color: '#2ECC71', emoji: '🍏' },
  { name: 'Yellow', color: '#F1C40F', emoji: '🍋' },
  { name: 'Purple', color: '#9B59B6', emoji: '🍇' },
  { name: 'Orange', color: '#E67E22', emoji: '🍊' },
];

export default function CandyColorGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_color' } = route.params || {};
  const [score, setScore] = useState(0);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [gameActive, setGameActive] = useState(true);

  const handleColorPick = (selectedColor) => {
    if (selectedColor.name === currentColor.name) {
      const newScore = score + 10;
      setScore(newScore);
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setCurrentColor(randomColor);
      
      if (newScore >= levelNumber * 50) {
        saveGameProgress(gameId, levelNumber, 3, newScore);
        setGameActive(false);
      }
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
      <Text style={styles.title}>🎨 Candy Color</Text>
      <Text style={styles.level}>Level {levelNumber}</Text>
      <Text style={styles.score}>⭐ Score: {score}</Text>
      
      <Text style={styles.question}>Tap the {currentColor.name} candy!</Text>
      <Text style={styles.candyEmoji}>{currentColor.emoji}</Text>
      
      <View style={styles.colorGrid}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color.name}
            style={[styles.colorButton, { backgroundColor: color.color }]}
            onPress={() => handleColorPick(color)}
          >
            <Text style={styles.colorEmoji}>{color.emoji}</Text>
            <Text style={styles.colorName}>{color.name}</Text>
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
  candyEmoji: { fontSize: 80, marginVertical: spacing.large },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: spacing.large },
  colorButton: { width: 100, padding: spacing.medium, margin: spacing.small, borderRadius: 15, alignItems: 'center' },
  colorEmoji: { fontSize: 30 },
  colorName: { fontSize: fontSizes.small, color: '#FFF', marginTop: 4, fontWeight: 'bold' },
});