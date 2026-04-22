import { StyleSheet, Text, View } from 'react-native';
import { candyTheme, spacing } from '../styles/theme';

export default function ScoreDisplay({ score, matches, moves, timeLeft, totalPairs }) {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>⭐ Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>🎯 Matches</Text>
        <Text style={styles.scoreValue}>{matches}/{totalPairs}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>🔄 Moves</Text>
        <Text style={styles.scoreValue}>{moves}</Text>
      </View>
      {timeLeft !== null && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⏱️ Time</Text>
          <Text style={[styles.scoreValue, timeLeft < 30 && styles.timerWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.medium,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    marginHorizontal: spacing.medium,
    marginTop: spacing.medium,
    flexWrap: 'wrap',
  },
  scoreBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.small,
  },
  scoreLabel: {
    fontSize: 12,
    color: candyTheme.textDark,
    marginBottom: spacing.small,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: candyTheme.candyPurple,
  },
  timerWarning: {
    color: candyTheme.candyRed,
  },
});