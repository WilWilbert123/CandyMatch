// src/games/CandyMemory/GameScreen.js
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
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
import { candyTheme, spacing } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Candy options with colors and emojis
const CANDIES = [
  { emoji: '🍬', color: '#FF69B4', name: 'Candy', bgColor: '#FF69B420' },
  { emoji: '🍭', color: '#9B59B6', name: 'Lollipop', bgColor: '#9B59B620' },
  { emoji: '🍫', color: '#8B4513', name: 'Chocolate', bgColor: '#8B451320' },
  { emoji: '🍪', color: '#D2691E', name: 'Cookie', bgColor: '#D2691E20' },
  { emoji: '🍩', color: '#FFB6C1', name: 'Donut', bgColor: '#FFB6C120' },
  { emoji: '🍰', color: '#FF69B4', name: 'Cake', bgColor: '#FF69B420' },
];

// Game configuration - LONGER GAME
const getGameConfig = (level) => ({
  sequenceSpeed: Math.max(800, 3000 - Math.floor(level / 2) * 100),
  targetScore: 100 + (level * 20), // Increased target score for longer game
  timeLimit: Math.max(45, 90 - Math.floor(level / 2)), // More time
  basePoints: 30, // More points per round
});

export default function CandyMemoryGame({ navigation, route }) {
  const { 
    levelNumber = 1, 
    gameId = 'candy_memory',
    timeLimit: customTimeLimit,
    targetScore: customTargetScore,
  } = route.params || {};
  
  const config = getGameConfig(levelNumber);
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [round, setRound] = useState(1);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [combo, setCombo] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Sound refs
  const correctSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Animation values
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [flashingIndex, setFlashingIndex] = useState(-1);
  const [pulsingIndex, setPulsingIndex] = useState(-1);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  const maxWrongAnswers = 5; // More mistakes allowed
  const [wrongAnswers, setWrongAnswers] = useState(0);
  
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
  
  // Animate candy press
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };
  
  // Start new round
  const startRound = () => {
    // Gradually increase sequence length (starts at 2, max 8)
    const sequenceLength = Math.min(2 + Math.floor(round / 3), 8);
    const availableCandies = CANDIES.slice(0, Math.min(4 + Math.floor(round / 5), CANDIES.length));
    
    // Generate new sequence
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomCandy = availableCandies[Math.floor(Math.random() * availableCandies.length)];
      newSequence.push(randomCandy);
    }
    
    setSequence(newSequence);
    setUserInput([]);
    setShowSequence(true);
    setIsWaiting(true);
    
    // Play sequence with highlighting
    let index = 0;
    const playNext = () => {
      if (index < newSequence.length) {
        const candyIndex = CANDIES.findIndex(c => c.emoji === newSequence[index].emoji);
        setHighlightedIndex(candyIndex);
        setPulsingIndex(candyIndex);
        playCorrectSound();
        setTimeout(() => {
          setHighlightedIndex(-1);
          setTimeout(() => setPulsingIndex(-1), 200);
          index++;
          setTimeout(playNext, config.sequenceSpeed);
        }, config.sequenceSpeed);
      } else {
        setTimeout(() => {
          setShowSequence(false);
          setIsWaiting(false);
        }, 500);
      }
    };
    playNext();
  };
  
  // Initialize first round
  useEffect(() => {
    startRound();
  }, []);
  
  // Handle candy press
  const handleCandyPress = async (candy, index) => {
    if (showSequence || isWaiting) return;
    if (!gameActive) return;
    
    animatePress();
    
    const currentCandy = CANDIES.find(c => c.emoji === candy);
    if (!currentCandy) return;
    
    setFlashingIndex(index);
    setTimeout(() => setFlashingIndex(-1), 200);
    
    const expectedCandy = sequence[userInput.length];
    if (!expectedCandy) return;
    
    const newInput = [...userInput, currentCandy];
    setUserInput(newInput);
    
    if (expectedCandy.emoji !== currentCandy.emoji) {
      // Wrong answer
      Vibration.vibrate(200);
      
      setWrongAnswers(prev => {
        const newWrong = prev + 1;
        if (newWrong >= maxWrongAnswers) {
          setGameActive(false);
        }
        return newWrong;
      });
      
      setCombo(0);
      return;
    }
    
    // Correct answer
    await playCorrectSound();
    Vibration.vibrate(50);
    
    if (newInput.length === sequence.length) {
      // Round complete - calculate points
      const sequenceBonus = sequence.length * 15;
      const comboBonus = Math.floor(sequenceBonus * (combo * 0.15));
      const totalGain = config.basePoints + sequenceBonus + comboBonus;
      
      setScore(prev => prev + totalGain);
      setCombo(prev => prev + 1);
      setRound(prev => prev + 1);
      
      // Check win condition
      if (score + totalGain >= targetScoreValue) {
        setGameActive(false);
        return;
      }
      
      // Start next round after delay
      setTimeout(() => startRound(), 1500);
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
    const percentage = score / targetScoreValue;
    if (percentage >= 1.5) return 3;
    if (percentage >= 1.0) return 2;
    if (percentage >= 0.7) return 1;
    return 0;
  };
  
  // Save and exit
  const saveAndExit = async () => {
    if (bgMusicRef.current) {
      try { await bgMusicRef.current.stopAsync(); } catch (e) {}
    }
    
    const stars = calculateStars();
    await saveGameProgress(gameId, levelNumber, stars, score);
    
    navigation.replace('CandyMemoryResult', {
      score,
      targetScore: targetScoreValue,
      stars,
      levelNumber,
      gameId: 'candy_memory',
      isWin: score >= targetScoreValue,
    });
  };
  
  useEffect(() => {
    if (!gameActive) {
      saveAndExit();
    }
  }, [gameActive]);
  
  // Game Over Screen
  if (!gameActive) {
    const stars = calculateStars();
    return (
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            {score >= targetScoreValue ? '🎉 WINNER! 🎉' : '😢 GAME OVER! 😢'}
          </Text>
          <Text style={styles.resultScore}>Score: {score} / {targetScoreValue}</Text>
          <Text style={styles.resultRound}>Rounds Completed: {round - 1}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3].map(star => (
              <Text key={star} style={styles.star}>
                {star <= stars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.playAgainBtn}
            onPress={() => navigation.replace('CandyMemory', { levelNumber, gameId })}
          >
            <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.btnGradient}>
              <Text style={styles.btnText}>🔄 Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.levelSelectBtn}
            onPress={() => navigation.navigate('CandyMemoryLevelSelect', { gameId })}
          >
            <Text style={styles.levelSelectText}>🗂️ Level Select</Text>
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
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.badgeText}>Level {levelNumber}</Text>
          </View>
          <View style={styles.roundBadge}>
            <Text style={styles.badgeText}>Round {round}</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{Math.max(0, targetScoreValue - score)}</Text>
            <Text style={styles.statLabel}>To Goal</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={[styles.statValue, timeLeft <= 10 && styles.warning]}>{timeLeft}s</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
        
        {combo > 1 && (
          <View style={styles.comboContainer}>
            <Text style={styles.comboText}>🔥 {combo}x COMBO! +{combo * 15}% 🔥</Text>
          </View>
        )}
        
        <View style={styles.missContainer}>
          <View style={styles.missBarBg}>
            <View style={[styles.missBarFill, { width: `${(wrongAnswers / maxWrongAnswers) * 100}%` }]} />
          </View>
          <Text style={styles.missText}>❤️ Mistakes: {wrongAnswers}/{maxWrongAnswers}</Text>
        </View>
      </View>
      
      {/* Scrollable Game Area */}
      <ScrollView 
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gameArea}>
          {/* Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>
              {showSequence ? '👀 WATCH THE SEQUENCE! 👀' : '🎯 REPEAT THE SEQUENCE! 🎯'}
            </Text>
          </View>
          
          {/* Sequence Display */}
          {showSequence && (
            <View style={styles.sequenceContainer}>
              <Text style={styles.sequenceLabel}>✨ Memory Challenge ✨</Text>
              <Text style={styles.sequenceLength}>Sequence length: {sequence.length}</Text>
              <View style={styles.sequenceRow}>
                {sequence.map((item, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.sequenceItem,
                      highlightedIndex === CANDIES.findIndex(c => c.emoji === item.emoji) && styles.sequenceItemActive
                    ]}
                  >
                    <Text style={styles.sequenceEmoji}>{item.emoji}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}
          
          {/* Candy Grid */}
          <View style={styles.candyGrid}>
            <Text style={styles.gridTitle}>Choose the next candy:</Text>
            <View style={styles.gridRow}>
              {CANDIES.map((candy, index) => (
                <TouchableOpacity
                  key={candy.emoji}
                  style={[
                    styles.candyButton,
                    { backgroundColor: candy.color + '20' },
                    highlightedIndex === index && styles.candyButtonHighlight,
                    flashingIndex === index && styles.candyButtonFlash,
                    pulsingIndex === index && styles.candyButtonPulse
                  ]}
                  onPress={() => handleCandyPress(candy.emoji, index)}
                  disabled={showSequence || isWaiting}
                  activeOpacity={0.7}
                >
                  <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                    <Text style={styles.candyEmoji}>{candy.emoji}</Text>
                    <Text style={styles.candyName}>{candy.name}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Progress Indicator */}
          {!showSequence && userInput.length > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progress: {userInput.length} / {sequence.length}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(userInput.length / sequence.length) * 100}%` }]} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  musicButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 15,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButtonText: { fontSize: 20 },
  
  // Header styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 15,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roundBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 2 },
  statLabel: { fontSize: 10, color: '#FFF', marginTop: 2 },
  warning: { color: '#FF4444' },
  comboContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  comboText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  missContainer: {
    marginTop: 8,
  },
  missBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  missBarFill: {
    height: '100%',
    backgroundColor: '#FF4444',
  },
  missText: {
    fontSize: 10,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Scroll Area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  gameArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  
  // Instruction
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  
  // Sequence Display
  sequenceContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sequenceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  sequenceLength: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 12,
    opacity: 0.8,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  sequenceItem: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    minWidth: 65,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sequenceItemActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }],
  },
  sequenceEmoji: { fontSize: 44 },
  
  // Candy Grid
  candyGrid: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    opacity: 0.8,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  candyButton: {
    padding: 18,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    minWidth: 95,
  },
  candyButtonHighlight: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.3)',
  },
  candyButtonFlash: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 0.95 }],
  },
  candyButtonPulse: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  candyEmoji: { fontSize: 48 },
  candyName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  
  // Progress Indicator
  progressContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
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
    marginBottom: 10,
  },
  resultRound: {
    fontSize: 18,
    color: '#FFD700',
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
    marginBottom: 15,
  },
  levelSelectBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  levelSelectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
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