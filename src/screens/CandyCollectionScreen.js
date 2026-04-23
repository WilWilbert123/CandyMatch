import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const ALL_CANDIES = [
  { id: 1, name: 'Gummy Bear', emoji: '🍬', unlockedByLevel: 1, rarity: 'common' },
  { id: 2, name: 'Lollipop', emoji: '🍭', unlockedByLevel: 5, rarity: 'common' },
  { id: 3, name: 'Chocolate', emoji: '🍫', unlockedByLevel: 10, rarity: 'common' },
  { id: 4, name: 'Cookie', emoji: '🍪', unlockedByLevel: 15, rarity: 'common' },
  { id: 5, name: 'Candy Corn', emoji: '🌽', unlockedByLevel: 20, rarity: 'rare' },
  { id: 6, name: 'Jelly Bean', emoji: '🫘', unlockedByLevel: 30, rarity: 'rare' },
  { id: 7, name: 'Caramel', emoji: '🍮', unlockedByLevel: 40, rarity: 'rare' },
  { id: 8, name: 'Mint', emoji: '🌿', unlockedByLevel: 50, rarity: 'epic' },
  { id: 9, name: 'Golden Candy', emoji: '⭐', unlockedByLevel: 75, rarity: 'legendary' },
  { id: 10, name: 'Rainbow Candy', emoji: '🌈', unlockedByLevel: 100, rarity: 'legendary' },
];

export default function CandyCollectionScreen() {
  const [collected, setCollected] = useState([]);

  useEffect(() => {
    loadCollected();
  }, []);

  const loadCollected = async () => {
    const collectedCandies = await AsyncStorage.getItem('collected_candies');
    setCollected(collectedCandies ? JSON.parse(collectedCandies) : []);
  };

  const renderCandy = ({ item }) => {
    const isCollected = collected.includes(item.emoji);
    return (
      <LinearGradient 
        colors={isCollected ? [candyTheme.candyGreen, candyTheme.candyBlue] : ['#999', '#666']} 
        style={styles.candyCard}
      >
        <Text style={styles.candyEmoji}>{item.emoji}</Text>
        <Text style={styles.candyName}>{item.name}</Text>
        <Text style={styles.candyRarity}>{item.rarity}</Text>
        {!isCollected && <Text style={styles.lockText}>🔒 Level {item.unlockedByLevel}</Text>}
        {isCollected && <Text style={styles.checkmark}>✅</Text>}
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <Text style={styles.title}>🍬 Candy Collection Book 🍬</Text>
      <Text style={styles.subtitle}>Collected: {collected.length}/{ALL_CANDIES.length}</Text>
      
      <FlatList
        data={ALL_CANDIES}
        renderItem={renderCandy}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, textAlign: 'center', marginTop: spacing.large },
  subtitle: { fontSize: fontSizes.body, color: candyTheme.textLight, textAlign: 'center', marginBottom: spacing.medium },
  grid: { padding: spacing.medium },
  candyCard: { 
    flex: 1, 
    margin: spacing.small, 
    padding: spacing.medium, 
    borderRadius: 15, 
    alignItems: 'center', 
    minHeight: 140 
  },
  candyEmoji: { fontSize: 50 },
  candyName: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight, marginTop: spacing.small },
  candyRarity: { fontSize: fontSizes.small, color: candyTheme.textLight, marginTop: 4 },
  lockText: { fontSize: fontSizes.small, color: candyTheme.textLight, marginTop: 8 },
  checkmark: { fontSize: 20, marginTop: 8 },
});