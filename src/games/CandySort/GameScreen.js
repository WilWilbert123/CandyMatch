// src/games/CandySort/GameScreen.js
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// IMPORTANT: Each candy has a specific type that determines which basket it goes to
const CANDIES = [
  { emoji: '🍬', color: '#FF69B4', type: 'pink', value: 10, displayType: 'Pink Candy' },
  { emoji: '🍭', color: '#9B59B6', type: 'purple', value: 10, displayType: 'Purple Candy' },
  { emoji: '🍫', color: '#8B4513', type: 'brown', value: 10, displayType: 'Chocolate' },
  { emoji: '🍪', color: '#D2691E', type: 'brown', value: 10, displayType: 'Cookie' },
  { emoji: '🍩', color: '#FFB6C1', type: 'pink', value: 15, displayType: 'Pink Donut' },
  { emoji: '🍰', color: '#FF69B4', type: 'pink', value: 20, displayType: 'Pink Cake' },
];

// Game configuration
const getGameConfig = (level) => ({
  targetScore: 50 + (level * 10),
  timeLimit: Math.max(30, 60 - Math.floor(level / 2)),
  penalty: 5,
  reward: 10,
});

export default function CandySortGame({ navigation, route }) {
  const { 
    levelNumber = 1, 
    gameId = 'candy_sort',
    timeLimit: customTimeLimit,
    targetScore: customTargetScore,
  } = route.params || {};
  
  const config = getGameConfig(levelNumber);
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [currentCandy, setCurrentCandy] = useState(null);
  const [combo, setCombo] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [shakeAnimation] = useState(new Animated.Value(0));
  
  // Sound refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Refs
  const comboTimeout = useRef(null);
  const feedbackTimeout = useRef(null);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  const maxWrongAnswers = 8;
  
  // Define available basket types (3 colors as BUBBLES/CIRCLES)
  const BASKETS = [
    { type: 'pink', label: 'Pink', emoji: '🌸', color: '#FF69B4', lightColor: '#FFB6C1' },
    { type: 'purple', label: 'Purple', emoji: '🟣', color: '#9B59B6', lightColor: '#BB8FCE' },
    { type: 'brown', label: 'Brown', emoji: '🟤', color: '#8B4513', lightColor: '#A0522D' },
  ];
  
  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        const { sound: bgMusic } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/candycatchbg.mp3'),
          { isLooping: true, volume: 0.3, shouldPlay: false }
        );
        bgMusicRef.current = bgMusic;
        
        const { sound: correctSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/pop.mp3')
        );
        correctSoundRef.current = correctSound;
        
        setSoundsReady(true);
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };
    
    loadSounds();
    
    return () => {
      if (bgMusicRef.current) bgMusicRef.current.unloadAsync();
      if (correctSoundRef.current) correctSoundRef.current.unloadAsync();
    };
  }, []);
  
  // Handle background music
  useEffect(() => {
    const handleMusic = async () => {
      if (!soundsReady) return;
      if (bgMusicRef.current) {
        try {
          if (gameActive && !isMusicMuted) {
            await bgMusicRef.current.playAsync();
          } else {
            await bgMusicRef.current.pauseAsync();
          }
        } catch (error) {}
      }
    };
    handleMusic();
  }, [gameActive, isMusicMuted, soundsReady]);
  
  // Play correct sound
  const playCorrectSound = async () => {
    if (!soundsReady || !correctSoundRef.current) return;
    try {
      const status = await correctSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await correctSoundRef.current.setPositionAsync(0);
        await correctSoundRef.current.playAsync();
      }
    } catch (error) {}
  };
  
  // Shake animation for wrong answer
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  // Show feedback message
  const showFeedback = (message, isCorrect) => {
    setFeedback({ message, isCorrect });
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => setFeedback(null), 1500);
  };
  
  // Generate new candy
  const generateNewQuestion = () => {
    const randomCandy = CANDIES[Math.floor(Math.random() * CANDIES.length)];
    setCurrentCandy(randomCandy);
  };
  
  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, []);
  
  // Handle sort action
  const handleSort = async (selectedType) => {
    if (!gameActive || !currentCandy) return;
    
    const isCorrect = selectedType === currentCandy.type;
    
    if (isCorrect) {
      await playCorrectSound();
      
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      setCombo(prev => prev + 1);
      
      const currentCombo = combo + 1;
      const bonus = Math.floor(currentCandy.value * (currentCombo * 0.1));
      const totalGain = currentCandy.value + bonus;
      
      setScore(prev => prev + totalGain);
      setCorrectAnswers(prev => prev + 1);
      
      showFeedback(`+${totalGain} 🎉 Correct!`, true);
      if (Platform.OS !== 'web') Vibration.vibrate(50);
      
      if (score + totalGain >= targetScoreValue) {
        setGameActive(false);
        return;
      }
      
      generateNewQuestion();
      
      comboTimeout.current = setTimeout(() => {
        setCombo(prev => Math.max(0, prev - 1));
      }, 2000);
      
    } else {
      setWrongAnswers(prev => {
        const newWrong = prev + 1;
        if (newWrong >= maxWrongAnswers) {
          setGameActive(false);
        }
        return newWrong;
      });
      
      setCombo(0);
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      setScore(prev => Math.max(0, prev - config.penalty));
      
      showFeedback(`-${config.penalty} ❌ Wrong! ${currentCandy.displayType} belongs in ${currentCandy.type} basket!`, false);
      shake();
      if (Platform.OS !== 'web') Vibration.vibrate(100);
    }
  };
  
  // Timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);
  
  // Toggle music
  const toggleMusic = async () => {
    if (!soundsReady) return;
    if (bgMusicRef.current) {
      try {
        if (isMusicMuted) {
          await bgMusicRef.current.playAsync();
          setIsMusicMuted(false);
        } else {
          await bgMusicRef.current.pauseAsync();
          setIsMusicMuted(true);
        }
      } catch (error) {}
    }
  };
  
  // Calculate stars
  const calculateStars = () => {
    if (score >= targetScoreValue * 1.5) return 3;
    if (score >= targetScoreValue) return 2;
    if (score >= targetScoreValue * 0.7) return 1;
    return 0;
  };
  
  // Save and exit
  const saveAndExit = async () => {
    if (bgMusicRef.current) {
      try { await bgMusicRef.current.stopAsync(); } catch (e) {}
    }
    
    const stars = calculateStars();
    await saveGameProgress(gameId, levelNumber, stars, score);
    
    navigation.replace('CandySortResult', {
      score,
      targetScore: targetScoreValue,
      stars,
      levelNumber,
      gameId: 'candy_sort',
      isWin: score >= targetScoreValue,
    });
  };
  
  useEffect(() => {
    if (!gameActive) {
      saveAndExit();
    }
  }, [gameActive]);
  
  // Game Over Screen
  if (!gameActive || !currentCandy) {
    const stars = calculateStars();
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            {score >= targetScoreValue ? '🎉 WINNER! 🎉' : '😢 GAME OVER! 😢'}
          </Text>
          <Text style={styles.resultScore}>Score: {score} / {targetScoreValue}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3].map(star => (
              <Text key={star} style={styles.star}>
                {star <= stars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.playAgainBtn}
            onPress={() => navigation.replace('CandySort', { levelNumber, gameId })}
          >
            <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.btnGradient}>
              <Text style={styles.btnText}>🔄 Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      {/* Music Toggle */}
      <TouchableOpacity style={styles.musicButton} onPress={toggleMusic}>
        <Text style={styles.musicButtonText}>{isMusicMuted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>
      
      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        <Text style={styles.levelBadge}>Level {levelNumber}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{Math.max(0, targetScoreValue - score)}</Text>
            <Text style={styles.statLabel}>Left</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={[styles.statValue, timeLeft <= 5 && styles.warning]}>{timeLeft}s</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
        
        {Math.floor(combo) > 1 && (
          <View style={styles.comboBox}>
            <Text style={styles.comboText}>🔥 {Math.floor(combo)}x COMBO! +{Math.floor(combo * 10)}% 🔥</Text>
          </View>
        )}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(score / targetScoreValue) * 100}%`, backgroundColor: '#4ECDC4' }]} />
          </View>
          <View style={styles.missBar}>
            <View style={[styles.missFill, { width: `${(wrongAnswers / maxWrongAnswers) * 100}%` }]} />
          </View>
          <Text style={styles.missText}>💔 Misses: {wrongAnswers}/{maxWrongAnswers}</Text>
        </View>
      </View>
      
      {/* Fixed Candy to Sort - Stays at top center */}
      <Animated.View style={[styles.candyFixedContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        <Text style={styles.sortInstruction}>
          Where does this candy go?
        </Text>
        
        <View style={[styles.candyCard, { backgroundColor: currentCandy.color + '20' }]}>
          <Text style={styles.candyEmoji}>{currentCandy.emoji}</Text>
          <Text style={styles.candyName}>{currentCandy.displayType}</Text>
        </View>
      </Animated.View>
      
      {/* Scrollable Bubble/Basket Options */}
      <ScrollView 
        style={styles.scrollableBaskets}
        contentContainerStyle={styles.basketsScrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text style={styles.basketTitle}>Choose a color basket:</Text>
        
        <View style={styles.bubblesContainer}>
          {BASKETS.map(basket => (
            <TouchableOpacity
              key={basket.type}
              style={styles.bubbleWrapper}
              onPress={() => handleSort(basket.type)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[basket.lightColor, basket.color]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bubble}
              >
                <View style={styles.bubbleInner}>
                  <Text style={styles.bubbleEmoji}>{basket.emoji}</Text>
                  <Text style={styles.bubbleLabel}>{basket.label}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Feedback Message */}
        {feedback && (
          <Animated.View style={[styles.feedbackContainer, feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </Animated.View>
        )}
        
        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.statItem}>
            <Text style={styles.statItemEmoji}>✅</Text>
            <Text style={styles.statItemValue}>{correctAnswers}</Text>
            <Text style={styles.statItemLabel}>Correct</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemEmoji}>❌</Text>
            <Text style={styles.statItemValue}>{wrongAnswers}</Text>
            <Text style={styles.statItemLabel}>Wrong</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemEmoji}>⚡</Text>
            <Text style={styles.statItemValue}>{Math.floor(combo)}</Text>
            <Text style={styles.statItemLabel}>Combo</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  musicButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButtonText: { 
    fontSize: 24 
  },
  
  // Fixed Header Section
  fixedHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 15,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  levelBadge: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 12,
    minWidth: 80,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#FFF' },
  warning: { color: '#FF4444' },
  comboBox: {
    alignItems: 'center',
    marginVertical: 5,
  },
  comboText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  missBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  missFill: {
    height: '100%',
    backgroundColor: '#FF4444',
  },
  missText: {
    fontSize: 10,
    color: '#FFF',
    textAlign: 'center',
  },
  
  // Fixed Candy to Sort Section
  candyFixedContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 25,
  },
  sortInstruction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  candyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 150,
  },
  candyEmoji: { 
    fontSize: 80 
  },
  candyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  
  // Scrollable Bubbles Section
  scrollableBaskets: {
    flex: 1,
    marginTop: 10,
  },
  basketsScrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  basketTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: candyTheme.textLight,
    textAlign: 'center',
    marginVertical: 10,
    opacity: 0.9,
  },
  bubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  bubbleWrapper: {
    marginVertical: 8,
  },
  bubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  bubbleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleEmoji: { 
    fontSize: 45,
    marginBottom: 8,
  },
  bubbleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Feedback
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 15,
    alignSelf: 'center',
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  
  // Stats Summary
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemEmoji: { 
    fontSize: 24 
  },
  statItemValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  statItemLabel: { 
    fontSize: 11, 
    color: '#FFF', 
    marginTop: 2 
  },
  
  // Result Screen
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 10,
  },
  playAgainBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});