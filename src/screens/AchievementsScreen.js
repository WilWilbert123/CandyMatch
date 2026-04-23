import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const { width } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: 1, name: 'First Steps', desc: 'Complete Level 1', emoji: '⭐', reward: 10, color: '#FFD700', icon: '🌟' },
  { id: 2, name: 'Hot Streak', desc: 'Play 7 days in a row', emoji: '🔥', reward: 50, color: '#FF6B35', icon: '🎯' },
  { id: 3, name: 'Perfect Score', desc: 'Get 3 stars on any level', emoji: '💪', reward: 20, color: '#4CAF50', icon: '⭐' },
  { id: 4, name: 'Candy Collector', desc: 'Unlock 5 candies', emoji: '🍬', reward: 30, color: '#FF69B4', icon: '🍭' },
  { id: 5, name: 'Speed Demon', desc: 'Complete a level in under 30 moves', emoji: '⚡', reward: 30, color: '#9C27B0', icon: '💨' },
  { id: 6, name: 'Master Collector', desc: 'Unlock all candies', emoji: '🏆', reward: 200, color: '#FFD700', icon: '👑' },
  { id: 7, name: 'Level Master', desc: 'Complete 50 levels', emoji: '👑', reward: 100, color: '#FF9800', icon: '🎮' },
  { id: 8, name: 'Legend', desc: 'Complete all 100 levels', emoji: '🌟', reward: 500, color: '#E91E63', icon: '🌈' },
];

export default function AchievementsScreen() {
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAchievements();
    loadTotalStars();
  }, []);

  const loadAchievements = async () => {
    const unlocked = await AsyncStorage.getItem('unlocked_achievements');
    setUnlockedIds(unlocked ? JSON.parse(unlocked) : []);
  };

  const loadTotalStars = async () => {
    const stars = await AsyncStorage.getItem('total_stars');
    setTotalStars(parseInt(stars) || 0);
  };

  const playConfettiAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAchievementPress = (achievement) => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    if (isUnlocked) {
      setSelectedAchievement(achievement);
      playConfettiAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setSelectedAchievement(null), 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const renderAchievement = ({ item, index }) => {
    const isUnlocked = unlockedIds.includes(item.id);
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <TouchableOpacity onPress={() => handleAchievementPress(item)} activeOpacity={0.8}>
        <Animated.View style={[
          styles.cardWrapper,
          isUnlocked && styles.unlockedWrapper,
          { transform: [{ scale: selectedAchievement?.id === item.id ? scaleAnim : 1 }] }
        ]}>
          <LinearGradient
            colors={isUnlocked ? 
              [item.color, item.color + 'CC'] : 
              ['#B0BEC5', '#78909C']}
            style={styles.achievementCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emojiContainer}>
              <Animated.Text style={[
                styles.achievementEmoji,
                isUnlocked && { transform: [{ rotate: spin }] }
              ]}>
                {isUnlocked ? item.emoji : '🔒'}
              </Animated.Text>
              {isUnlocked && (
                <View style={styles.sparkleContainer}>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              )}
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{item.name}</Text>
              <Text style={styles.achievementDesc}>
                {isUnlocked ? item.desc : '???'}
              </Text>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.achievementReward}>{item.reward}</Text>
              </View>
            </View>
            
            {isUnlocked && (
              <View style={styles.statusContainer}>
                <Text style={styles.checkmark}>✅</Text>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.completedBadge}
                >
                  <Text style={styles.completedText}>DONE!</Text>
                </LinearGradient>
              </View>
            )}
          </LinearGradient>
          
          {/* Progress bar for locked achievements */}
          {!isUnlocked && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>🔒 Locked</Text>
              <Text style={styles.lockedHint}>Keep playing to unlock!</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const getCompletionPercentage = () => {
    return (unlockedIds.length / ACHIEVEMENTS.length) * 100;
  };

  return (
    <LinearGradient 
      colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} 
      style={styles.container}
    >
      {/* Header with animated stars */}
      <View style={styles.header}>
        <Text style={styles.title}>
          🏆 Achievement Gallery 🏆
        </Text>
        
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.statsBadge}
          >
            <Text style={styles.statsIcon}>⭐</Text>
            <Text style={styles.starsCount}>{totalStars}</Text>
          </LinearGradient>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {unlockedIds.length} / {ACHIEVEMENTS.length} Unlocked
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: `${getCompletionPercentage()}%` }
                ]}
              />
            </View>
          </View>
          
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.completionBadge}
          >
            <Text style={styles.completionText}>
              {Math.round(getCompletionPercentage())}%
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Achievement List */}
      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />

      {/* Floating encouragement message */}
      {unlockedIds.length > 0 && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            🎉 You're a superstar! Keep collecting! 🎉
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    paddingTop: spacing.large,
    paddingHorizontal: spacing.medium,
  },
  title: { 
    fontSize: fontSizes.title + 4, 
    fontWeight: 'bold', 
    color: candyTheme.textLight, 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginBottom: spacing.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: spacing.small,
    marginBottom: spacing.medium,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xsmall,
    borderRadius: 15,
    minWidth: 60,
    justifyContent: 'center',
  },
  statsIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  starsCount: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: spacing.small,
  },
  progressText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  completionBadge: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xsmall,
    borderRadius: 15,
  },
  completionText: {
    fontSize: fontSizes.small,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  list: { 
    padding: spacing.medium,
    paddingTop: 0,
  },
  cardWrapper: {
    marginVertical: spacing.small,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  unlockedWrapper: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    elevation: 8,
  },
  achievementCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: spacing.medium, 
    borderRadius: 20,
    minHeight: 110,
  },
  emojiContainer: {
    position: 'relative',
    marginRight: spacing.medium,
  },
  achievementEmoji: { 
    fontSize: 50,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle: {
    fontSize: 16,
  },
  achievementInfo: { 
    flex: 1,
  },
  achievementName: { 
    fontSize: fontSizes.body + 2, 
    fontWeight: 'bold', 
    color: candyTheme.textLight,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  achievementDesc: { 
    fontSize: fontSizes.small, 
    color: candyTheme.textLight, 
    marginTop: 4,
    opacity: 0.9,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  achievementReward: { 
    fontSize: fontSizes.small, 
    color: candyTheme.textLight,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
  },
  checkmark: { 
    fontSize: 28,
    marginBottom: 4,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  lockedText: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: candyTheme.textLight,
  },
  lockedHint: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    marginTop: 4,
  },
  encouragementContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,215,0,0.9)',
    padding: spacing.small,
    borderRadius: 25,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: fontSizes.small,
    fontWeight: 'bold',
    color: '#333',
  },
});