import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const ACHIEVEMENTS = [
  { id: 1, name: 'First Steps', desc: 'Complete Level 1', emoji: '⭐', reward: 10 },
  { id: 2, name: 'Hot Streak', desc: 'Play 7 days in a row', emoji: '🔥', reward: 50 },
  { id: 3, name: 'Perfect Score', desc: 'Get 3 stars on any level', emoji: '💪', reward: 20 },
  { id: 4, name: 'Candy Collector', desc: 'Unlock 5 candies', emoji: '🍬', reward: 30 },
  { id: 5, name: 'Speed Demon', desc: 'Complete a level in under 30 moves', emoji: '⚡', reward: 30 },
  { id: 6, name: 'Master Collector', desc: 'Unlock all candies', emoji: '🏆', reward: 200 },
  { id: 7, name: 'Level Master', desc: 'Complete 50 levels', emoji: '👑', reward: 100 },
  { id: 8, name: 'Legend', desc: 'Complete all 100 levels', emoji: '🌟', reward: 500 },
];

export default function AchievementsScreen() {
  const [unlockedIds, setUnlockedIds] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const unlocked = await AsyncStorage.getItem('unlocked_achievements');
    setUnlockedIds(unlocked ? JSON.parse(unlocked) : []);
  };

  const renderAchievement = ({ item }) => {
    const isUnlocked = unlockedIds.includes(item.id);
    return (
      <LinearGradient 
        colors={isUnlocked ? [candyTheme.candyGreen, candyTheme.candyBlue] : ['#999', '#666']} 
        style={styles.achievementCard}
      >
        <Text style={styles.achievementEmoji}>{item.emoji}</Text>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementName}>{item.name}</Text>
          <Text style={styles.achievementDesc}>{item.desc}</Text>
          <Text style={styles.achievementReward}>Reward: ⭐ {item.reward}</Text>
        </View>
        {isUnlocked && <Text style={styles.checkmark}>✅</Text>}
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <Text style={styles.title}>🏆 Achievements 🏆</Text>
      <Text style={styles.subtitle}>Unlocked: {unlockedIds.length}/{ACHIEVEMENTS.length}</Text>
      
      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSizes.title, fontWeight: 'bold', color: candyTheme.textLight, textAlign: 'center', marginTop: spacing.large },
  subtitle: { fontSize: fontSizes.body, color: candyTheme.textLight, textAlign: 'center', marginBottom: spacing.medium },
  list: { padding: spacing.medium },
  achievementCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: spacing.medium, 
    marginVertical: spacing.small, 
    borderRadius: 15 
  },
  achievementEmoji: { fontSize: 40, marginRight: spacing.medium },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: fontSizes.body, fontWeight: 'bold', color: candyTheme.textLight },
  achievementDesc: { fontSize: fontSizes.small, color: candyTheme.textLight, marginTop: 4 },
  achievementReward: { fontSize: fontSizes.small, color: candyTheme.textLight, marginTop: 4 },
  checkmark: { fontSize: 24 },
});