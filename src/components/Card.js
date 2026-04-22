import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { candyTheme, spacing } from '../styles/theme';

export default function Card({ emoji, isFlipped, isMatched, onPress }) {
  // Matched card - show emoji with green background
  if (isMatched) {
    return (
      <View style={[styles.card, styles.matchedCard]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    );
  }

  // Flipped card - show emoji
  if (isFlipped) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.card, styles.frontCard]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Face down card - show question mark
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, styles.backCard]}>
        <Text style={styles.questionMark}>?</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 75,
    height: 90,
    margin: spacing.small,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: candyTheme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: candyTheme.shadowOpacity,
    shadowRadius: candyTheme.shadowRadius,
    elevation: 5,
  },
  frontCard: {
    backgroundColor: candyTheme.cardFront,
    borderWidth: 3,
    borderColor: candyTheme.candyPink,
  },
  backCard: {
    backgroundColor: candyTheme.candyPink,
  },
  matchedCard: {
    backgroundColor: candyTheme.candyGreen,
    opacity: 0.6,
  },
  emoji: {
    fontSize: 35,
  },
  questionMark: {
    fontSize: 45,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
});