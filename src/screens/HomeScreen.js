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

// Floating Candy Piece Animation
const FloatingCandy = ({ delay, left, size, emoji }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );

    setTimeout(() => {
      floatAnimation.start();
      rotateAnimation.start();
    }, delay);

    return () => {
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, [delay]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingCandy,
        {
          left: left,
          fontSize: size,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}>
      {emoji}
    </Animated.Text>
  );
};

// Custom animated button component with stable pop/zoom effect
const AnimatedButton = ({ item, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered pop animation for each button
    const delay = index * 150;
    
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(popAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Pop animation interpolation
  const popScale = popAnim.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [0.7, 1.05, 0.98, 1],
  });

  const popTranslateY = popAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [30, -5, 0],
  });

  const popOpacity = popAnim.interpolate({
    inputRange: [0, 0.2, 0.6, 1],
    outputRange: [0, 0.7, 1, 1],
  });

  return (
    <Animated.View
      style={[
        styles.menuButtonWrapper,
        {
          opacity: popOpacity,
          transform: [
            { scale: Animated.multiply(scaleAnim, popScale) },
            { translateY: popTranslateY },
          ],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
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
              <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// User Stats Card with confetti effect
const UserStatsCard = ({ stars, itemsCount, highScore, totalGamesPlayed }) => {
  const starPulse = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Star pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.spring(starPulse, {
          toValue: 1.15,
          friction: 2,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(starPulse, {
          toValue: 1,
          friction: 2,
          tension: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          transform: [{ scale: cardScale }],
          opacity: cardOpacity,
        },
      ]}>
      <LinearGradient
        colors={['rgba(255,215,0,0.3)', 'rgba(255,105,180,0.2)']}
        style={styles.statsCard}>
        <View style={styles.statItem}>
          <Animated.Text style={[styles.statEmoji, { transform: [{ scale: starPulse }] }]}>
            ⭐
          </Animated.Text>
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

// Ripple Effect Component
const RippleEffect = ({ x, y, visible }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0.8);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: x - 50,
          top: y - 50,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}>
      <LinearGradient
        colors={['rgba(255,215,0,0.8)', 'rgba(255,105,180,0.6)']}
        style={styles.rippleGradient}
      />
    </Animated.View>
  );
};

// Floating Stars Animation
const FloatingStar = ({ delay, left, top }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);

    setTimeout(() => {
      animation.start();
    }, delay);

    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.Text
      style={[
        styles.floatingStar,
        {
          left: left,
          top: top,
          transform: [{ translateY }, { scale }],
          opacity: opacity,
        },
      ]}>
      ⭐
    </Animated.Text>
  );
};

export default function HomeScreen({ navigation }) {
  const [stars, setStars] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [ripple, setRipple] = useState({ x: 0, y: 0, visible: false });
  const [floatingStars, setFloatingStars] = useState([]);
  const [tapEffectVisible, setTapEffectVisible] = useState(false);

  // Entrance animations
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(0.9)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  // Enhanced menu items
  const menuItems = [
    {
      title: 'Game Hub',
      emoji: '🎮',
      description: 'Play 10 awesome candy games!',
      screen: 'GameHub',
      colors: ['#FFD700', '#FF8C00'],
    },
    {
      title: 'Global High Scores',
      emoji: '🌍',
      description: 'See who\'s the candy champion!',
      screen: 'GlobalHighScores',
      colors: ['#00CED1', '#1E90FF'],
    },
    {
      title: 'Candy Collection',
      emoji: '🍬',
      description: 'Your sweet collection gallery',
      screen: 'CandyCollection',
      colors: ['#FF69B4', '#DA70D6'],
    },
    {
      title: 'Candy Shop',
      emoji: '🏪',
      description: 'Spend stars on cool items!',
      screen: 'CandyShop',
      colors: ['#32CD32', '#228B22'],
    },
    {
      title: 'Achievements',
      emoji: '🏆',
      description: 'Unlock awesome badges!',
      screen: 'Achievements',
      colors: ['#FF4500', '#FF1493'],
    },
  ];

  // Floating candies positions
  const floatingCandies = [
    { emoji: '🍬', left: '5%', size: 30, delay: 0 },
    { emoji: '🍭', left: '85%', size: 35, delay: 500 },
    { emoji: '🍫', left: '15%', size: 25, delay: 1000 },
    { emoji: '🍬', left: '75%', size: 28, delay: 1500 },
    { emoji: '🍭', left: '45%', size: 32, delay: 2000 },
    { emoji: '🍬', left: '60%', size: 24, delay: 2500 },
    { emoji: '🍫', left: '30%', size: 30, delay: 3000 },
  ];

  useEffect(() => {
    loadUserData();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(welcomeScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 500,
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

  const handleTapEffect = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    setRipple({ x: locationX, y: locationY, visible: true });
    setTimeout(() => setRipple({ ...ripple, visible: false }), 600);
    
    const newStars = [];
    for (let i = 0; i < 8; i++) {
      newStars.push({
        id: Date.now() + i,
        left: locationX - 20 + Math.random() * 40,
        top: locationY - 20 + Math.random() * 40,
        delay: i * 50,
      });
    }
    setFloatingStars(newStars);
    setTimeout(() => setFloatingStars([]), 2000);
    
    setTapEffectVisible(true);
    setTimeout(() => setTapEffectVisible(false), 200);
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
        
        {/* Floating candies background */}
        {floatingCandies.map((candy, index) => (
          <FloatingCandy key={index} {...candy} />
        ))}
        
        {/* Floating stars from taps */}
        {floatingStars.map((star) => (
          <FloatingStar key={star.id} {...star} />
        ))}
        
        {/* Ripple effect */}
        <RippleEffect {...ripple} />
        
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={true}>
            
            {/* Welcome Section */}
            <Animated.View
              style={[
                styles.welcomeSection,
                {
                  opacity: welcomeOpacity,
                  transform: [{ scale: welcomeScale }],
                },
              ]}>
              <Text style={styles.welcomeText}>🎉 Welcome, Candy Champion! 🎉</Text>
            </Animated.View>

            {/* Header Section */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: headerOpacity,
                  transform: [{ scale: headerScale }],
                },
              ]}>
              <Text style={styles.title}>
                Candy Match
                <Text style={styles.titleAccent}> Adventure</Text>
              </Text>
            </Animated.View>

            {/* User Stats Card */}
            <UserStatsCard
              stars={stars}
              itemsCount={itemsCount}
              highScore={highScore}
              totalGamesPlayed={totalGamesPlayed}
            />

            {/* Menu Section - Buttons pop in automatically */}
            <View style={styles.menuSection}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuSectionTitle}>Choose Your Game!</Text>
              </View>

              {/* Each button pops in with staggered delay */}
              {menuItems.map((item, index) => (
                <AnimatedButton
                  key={index}
                  item={item}
                  index={index}
                  onPress={() => handleNavigation(item.screen)}
                />
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🍭 Developed by John Wilbert Gamis 🍬
              </Text>
              <Text style={styles.footerVersion}>Version 2.0.0 ⭐</Text>
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
  
  floatingCandy: {
    position: 'absolute',
    top: -30,
    opacity: 0.4,
    zIndex: 0,
  },
  
  floatingStar: {
    position: 'absolute',
    fontSize: 20,
    zIndex: 999,
  },
  
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: 1000,
  },
  
  rippleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  
  welcomeSection: {
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  title: { 
    fontSize: 48, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    textShadowColor: 'rgba(0,0,0,0.3)', 
    textShadowOffset: { width: 0, height: 3 }, 
    textShadowRadius: 6, 
    marginBottom: 12,
    letterSpacing: 1,
  },
  titleAccent: { color: '#FFD700', textShadowColor: 'rgba(0,0,0,0.2)' },
  
  statsContainer: { width: width * 0.94, marginBottom: 24 },
  statsCard: { 
    flexDirection: 'row', 
    borderRadius: 30, 
    padding: 20, 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderWidth: 2, 
    borderColor: 'rgba(255,215,0,0.5)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 32, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#FFD700', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 2, height: 45, backgroundColor: 'rgba(255,215,0,0.5)', borderRadius: 1 },
  
  menuSection: { width: width * 0.92, marginTop: 8 },
  menuHeader: { marginBottom: 20, paddingHorizontal: 8 },
  menuSectionTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  
  menuButtonWrapper: { marginBottom: 14 },
  menuGradient: { 
    borderRadius: 25, 
    padding: 18, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.3)',
  },
  menuContent: { flexDirection: 'row', alignItems: 'center' },
  menuEmoji: { fontSize: 48, marginRight: 18 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, letterSpacing: 0.5 },
  menuDescription: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  menuArrow: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  footerVersion: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});