import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme, fontSizes, spacing } from '../../styles/theme';

const { width } = Dimensions.get('window');

const PUZZLE_PIECES = ['🧩', '🍬', '🍭', '🍫', '🍪', '🍩', '🧁', '🍰'];

export default function CandyPuzzleGame({ navigation, route }) {
  const { levelNumber = 1, gameId = 'candy_puzzle' } = route.params || {};
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [pieces, setPieces] = useState([...PUZZLE_PIECES].sort(() => Math.random() - 0.5));
  const [selectedPiece, setSelectedPiece] = useState(null);

  const handlePiecePress = (index) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      // Swap pieces
      const newPieces = [...pieces];
      [newPieces[selectedPiece], newPieces[index]] = [newPieces[index], newPieces[selectedPiece]];
      setPieces(newPieces);
      setSelectedPiece(null);
      
      const newScore = score + 10;
      setScore(newScore);
      
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
      <Text style={styles.title}>🧩 Candy Puzzle</Text>
      <Text style={styles.level}>Level {levelNumber}</Text>
      <Text style={styles.score}>⭐ Score: {score}</Text>
      
      <Text style={styles.instruction}>Tap two pieces to swap them</Text>
      
      <View style={styles.puzzleGrid}>
        {pieces.map((piece, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.puzzlePiece, selectedPiece === index && styles.selectedPiece]}
            onPress={() => handlePiecePress(index)}
          >
            <Text style={styles.pieceEmoji}>{piece}</Text>
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
  instruction: { fontSize: fontSizes.small, color: candyTheme.textLight, marginVertical: spacing.medium },
  puzzleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: spacing.large, width: width - spacing.large * 2 },
  puzzlePiece: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', margin: spacing.small },
  selectedPiece: { borderWidth: 3, borderColor: candyTheme.candyYellow },
  pieceEmoji: { fontSize: 35 },
});