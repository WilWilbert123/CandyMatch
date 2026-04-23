import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

// Custom animated button component
const AnimatedButton = ({ item, index, onPress, fadeAnim, slideAnim }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Glow animation for first button (Game Hub)
    if (index === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.menuButtonWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        <Animated.View
          style={[
            styles.glowContainer,
            index === 0 && {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 20],
              }),
            },
          ]}>
          <LinearGradient
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.menuGradient}>
            <View style={styles.menuContent}>
              <Text style={styles.menuEmoji}>{item.emoji || '🎮'}</Text>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View style={styles.menuArrow}>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Reset Confirmation Modal
const ResetModal = ({ visible, onClose, onConfirm }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      overlayAnim.setValue(0);
    }
  }, [visible]);

  
};

// User Stats Card
const UserStatsCard = ({ stars, itemsCount, highScore, totalGamesPlayed }) => {
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(statsAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statsContainer,
        { transform: [{ scale: statsAnim }] },
      ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
        style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{stars}</Text>
          <Text style={styles.statLabel}>Stars</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🎨</Text>
          <Text style={styles.statValue}>{itemsCount}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🎮</Text>
          <Text style={styles.statValue}>{totalGamesPlayed}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{highScore}</Text>
          <Text style={styles.statLabel}>Top Score</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const [stars, setStars] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Enhanced menu items with descriptions and emojis
  const menuItems = [
    {
      title: 'Game Hub',
      emoji: '🎮',
      description: 'Play all candy games',
      screen: 'GameHub',
      colors: ['#F1C40F', '#E67E22'],
    },
    {
      title: 'Global High Scores',
      emoji: '🌍',
      description: 'View all game records',
      screen: 'GlobalHighScores',
      colors: ['#FF6B6B', '#4ECDC4'],
    },
    {
      title: 'Candy Collection',
      emoji: '🍬',
      description: 'View your collection',
      screen: 'CandyCollection',
      colors: ['#FF69B4', '#9B59B6'],
    },
    {
      title: 'Candy Shop',
      emoji: '🏪',
      description: 'Spend your stars',
      screen: 'CandyShop',
      colors: ['#3498DB', '#2ECC71'],
    },
    {
      title: 'Achievements',
      emoji: '🏆',
      description: 'Track your progress',
      screen: 'Achievements',
      colors: ['#E67E22', '#E74C3C'],
    },
  ];

  useEffect(() => {
    loadUserData();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
    try {
      const totalStars = await AsyncStorage.getItem('total_stars');
      setStars(totalStars ? parseInt(totalStars) : 0);

      const purchasedItems = await AsyncStorage.getItem('purchased_items');
      const purchased = purchasedItems ? JSON.parse(purchasedItems) : [];
      setItemsCount(purchased.length);

      const savedHighScore = await AsyncStorage.getItem('high_score');
      setHighScore(savedHighScore ? parseInt(savedHighScore) : 0);

      // Load total games played from all game sessions
      const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
      let totalGames = 0;
      for (const gameId of allGames) {
        const sessions = await AsyncStorage.getItem(`@candy_game_sessions_${gameId}`);
        if (sessions) {
          const parsed = JSON.parse(sessions);
          totalGames += parsed.length;
        }
      }
      setTotalGamesPlayed(totalGames);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleResetProgress = async () => {
    try {
      // Clear all game data
      const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
      
      for (const gameId of allGames) {
        await AsyncStorage.removeItem(`@candy_game_sessions_${gameId}`);
        await AsyncStorage.removeItem(`@candy_match_level_progress_${gameId}`);
        await AsyncStorage.setItem(`@candy_match_unlocked_levels_${gameId}`, JSON.stringify([1]));
      }
      
      // Clear user data
      await AsyncStorage.removeItem('total_stars');
      await AsyncStorage.removeItem('purchased_items');
      await AsyncStorage.removeItem('high_score');
      await AsyncStorage.removeItem('achievements');
      
      // Reset state
      setStars(0);
      setItemsCount(0);
      setHighScore(0);
      setTotalGamesPlayed(0);
      
      setResetModalVisible(false);
      
      // Show success message (optional)
      alert('All progress has been reset successfully!');
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Error resetting progress. Please try again.');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={true}>
            {/* Header Section */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: headerScaleAnim }],
                },
              ]}>
              <Text style={styles.title}>
                Candy Match
                <Text style={styles.titleAccent}> Adventure</Text>
              </Text>
              <Text style={styles.subtitle}>
                Collect stars, unlock achievements, and become the candy master!
              </Text>
            </Animated.View>

            {/* User Stats Card */}
            <UserStatsCard
              stars={stars}
              itemsCount={itemsCount}
              highScore={highScore}
              totalGamesPlayed={totalGamesPlayed}
            />

            {/* Menu Section */}
            <View style={styles.menuSection}>
              <Animated.View
                style={[
                  styles.menuHeader,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                  },
                ]}>
                <Text style={styles.menuSectionTitle}>Game Modes</Text>
                <Text style={styles.menuSectionSubtitle}>
                  Choose your adventure
                </Text>
              </Animated.View>

              {menuItems.map((item, index) => (
                <AnimatedButton
                  key={index}
                  item={item}
                  index={index}
                  onPress={() => handleNavigation(item.screen)}
                  fadeAnim={fadeAnim}
                  slideAnim={slideAnim}
                />
              ))}

              {/* Reset Button */}
              <Animated.View
                style={[
                  styles.resetButtonWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                  },
                ]}>
               
              </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Developed by John Wilbert Gamis
              </Text>
              <Text style={styles.footerVersion}>Version 2.0.0</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { alignItems: 'center', paddingVertical: 20, paddingBottom: 40 },
  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  headerBadge: { backgroundColor: 'rgba(255,215,0,0.9)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  headerBadgeText: { fontSize: 12, fontWeight: '800', color: '#2C3E50' },
  title: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: 8 },
  titleAccent: { color: '#FFD700' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  statsContainer: { width: width * 0.92, marginBottom: 24 },
  statsCard: { flexDirection: 'row', borderRadius: 20, padding: 16, justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statItem: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  menuSection: { width: width * 0.92, marginTop: 8 },
  menuHeader: { marginBottom: 16, paddingHorizontal: 8 },
  menuSectionTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  menuSectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  menuButtonWrapper: { marginBottom: 12 },
  glowContainer: { borderRadius: 20, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 10 },
  menuGradient: { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  menuContent: { flexDirection: 'row', alignItems: 'center' },
  menuEmoji: { fontSize: 40, marginRight: 16 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  menuDescription: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  menuArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  resetButtonWrapper: { marginTop: 16, marginBottom: 8 },
  resetButton: { borderRadius: 20, overflow: 'hidden' },
  resetGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  resetButtonEmoji: { fontSize: 20 },
  resetButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  footerVersion: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
 
  
});