// src/games/CandyCatch/GameScreen.js
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View
} from 'react-native';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game configuration
const getGameConfig = (level) => ({
  timeLimit: Math.max(20, 35 - Math.floor(level / 5)),
  targetScore: 40 + (level * 3),
  fallSpeed: 4,
  spawnRate: 700,
});

export default function CandyCatchGame({ navigation, route }) {
  const { 
    levelNumber = 1, 
    gameId = 'candy_catch',
    timeLimit: customTimeLimit,
    targetScore: customTargetScore,
  } = route.params || {};
  
  const config = getGameConfig(levelNumber);
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [candies, setCandies] = useState([]);
  const [combo, setCombo] = useState(0);
  const [missedCandies, setMissedCandies] = useState(0);
  const [tapEffect, setTapEffect] = useState(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Sound refs
  const popSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [soundError, setSoundError] = useState(false);
  
  // Refs
  const spawnInterval = useRef(null);
  const gameLoopInterval = useRef(null);
  const comboTimeout = useRef(null);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  
  // Candy types with emojis and values
  const candyTypes = [
    { emoji: '🍬', value: 1, size: 50, color: '#FF6B6B' },
    { emoji: '🍭', value: 1, size: 55, color: '#FF8E8E' },
    { emoji: '🍫', value: 2, size: 60, color: '#8B4513' },
    { emoji: '🍪', value: 5, size: 55, color: '#D2691E' },
    { emoji: '🍩', value: 3, size: 65, color: '#FFB6C1' },
    { emoji: '🍰', value: 5, size: 70, color: '#FF69B4' },
  ];
  
  // Load background music and pop sound
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
        });
        
        const { sound: bgMusic } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/candycatchbg.mp3'),
          { 
            isLooping: true,
            volume: 0.5,
            shouldPlay: false,
          }
        );
        bgMusicRef.current = bgMusic;
        
        const { sound: popSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/pop.mp3')
        );
        popSoundRef.current = popSound;
        
        setSoundsReady(true);
        console.log('Sounds loaded successfully');
        
      } catch (error) {
        console.log('Error loading sounds:', error);
        setSoundError(true);
      }
    };
    
    loadSounds();
    
    return () => {
      const cleanup = async () => {
        if (bgMusicRef.current) {
          try {
            await bgMusicRef.current.stopAsync();
            await bgMusicRef.current.unloadAsync();
          } catch (e) {}
        }
        if (popSoundRef.current) {
          try {
            await popSoundRef.current.unloadAsync();
          } catch (e) {}
        }
      };
      cleanup();
    };
  }, []);
  
  // Handle game active state - play/pause music
  useEffect(() => {
    const handleMusic = async () => {
      if (!soundsReady || soundError) return;
      
      if (bgMusicRef.current) {
        try {
          if (gameActive && !isMusicMuted) {
            const status = await bgMusicRef.current.getStatusAsync();
            if (status.isLoaded && !status.isPlaying) {
              await bgMusicRef.current.playAsync();
            }
          } else if (bgMusicRef.current) {
            const status = await bgMusicRef.current.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await bgMusicRef.current.pauseAsync();
            }
          }
        } catch (error) {
          console.log('Error handling music:', error);
        }
      }
    };
    
    handleMusic();
  }, [gameActive, isMusicMuted, soundsReady, soundError]);
  
  // Toggle music mute/unmute
  const toggleMusic = async () => {
    if (!soundsReady || soundError) return;
    
    if (bgMusicRef.current) {
      try {
        if (isMusicMuted) {
          await bgMusicRef.current.playAsync();
          setIsMusicMuted(false);
        } else {
          await bgMusicRef.current.pauseAsync();
          setIsMusicMuted(true);
        }
      } catch (error) {
        console.log('Error toggling music:', error);
      }
    }
  };
  
  // Play pop sound with safety checks
  const playPopSound = async () => {
    if (!soundsReady || soundError || !popSoundRef.current) {
      return;
    }
    
    try {
      const status = await popSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await popSoundRef.current.setPositionAsync(0);
        await popSoundRef.current.playAsync();
      }
    } catch (error) {
      // Silently fail
    }
  };
  
  // Spawn candy
  const spawnCandy = () => {
    const candyType = candyTypes[Math.floor(Math.random() * candyTypes.length)];
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - candyType.size),
      y: -candyType.size,
      ...candyType,
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
    };
  };
  
  // Start spawning
  useEffect(() => {
    if (!gameActive) return;
    
    spawnInterval.current = setInterval(() => {
      setCandies(prev => [...prev, spawnCandy()]);
    }, config.spawnRate);
    
    return () => {
      if (spawnInterval.current) clearInterval(spawnInterval.current);
    };
  }, [gameActive, config.spawnRate]);
  
  // Animate candies
  useEffect(() => {
    candies.forEach(candy => {
      if (candy.rotation && !candy.rotation._animation) {
        Animated.loop(
          Animated.timing(candy.rotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(candy.scale, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(candy.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [candies]);
  
  // Handle candy tap
  const handleCandyTap = async (candy, candyId) => {
    if (!gameActive) return;
    
    const candyToCatch = candies.find(c => c.id === candyId);
    if (!candyToCatch) return;
    
    const tapX = candyToCatch.x + candyToCatch.size / 2;
    const tapY = candyToCatch.y + candyToCatch.size / 2;
    
    playPopSound();
    
    setTapEffect({ x: tapX, y: tapY });
    setTimeout(() => setTapEffect(null), 200);
    
    setCandies(prev => prev.filter(c => c.id !== candyId));
    
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    
    setCombo(prev => prev + 1);
    
    const currentCombo = combo + 1;
    const bonus = Math.floor(candyToCatch.value * (currentCombo * 0.1));
    const totalGain = candyToCatch.value + bonus;
    
    setScore(prev => prev + totalGain);
    
    if (Platform.OS !== 'web') Vibration.vibrate(20);
    
    comboTimeout.current = setTimeout(() => {
      setCombo(prev => Math.max(0, prev - 1));
    }, 1500);
  };
  
  // Main game loop - move candies down
  useEffect(() => {
    if (!gameActive) return;
    
    gameLoopInterval.current = setInterval(() => {
      setCandies(prevCandies => {
        const remainingCandies = [];
        
        for (const candy of prevCandies) {
          const newY = candy.y + config.fallSpeed;
          
          if (newY + candy.size >= SCREEN_HEIGHT) {
            setMissedCandies(prev => {
              const newMissed = prev + 1;
              if (newMissed >= 8) {
                setGameActive(false);
              }
              return newMissed;
            });
            
            setCombo(0);
            if (comboTimeout.current) clearTimeout(comboTimeout.current);
          } 
          else {
            remainingCandies.push({ ...candy, y: newY });
          }
        }
        
        return remainingCandies;
      });
    }, 1000 / 60);
    
    return () => {
      if (gameLoopInterval.current) clearInterval(gameLoopInterval.current);
    };
  }, [gameActive, config.fallSpeed]);
  
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
  
  // Win condition
  useEffect(() => {
    if (score >= targetScoreValue && gameActive) {
      setGameActive(false);
    }
  }, [score, targetScoreValue, gameActive]);
  
  // Calculate stars
  const calculateStars = () => {
    if (score >= targetScoreValue * 1.5) return 3;
    if (score >= targetScoreValue) return 2;
    if (score >= targetScoreValue * 0.7) return 1;
    return 0;
  };
  
  // Save and exit - FIXED: Use CandyCatchResult
  const saveAndExit = async () => {
    if (bgMusicRef.current && soundsReady) {
      try {
        await bgMusicRef.current.stopAsync();
      } catch (error) {}
    }
    
    const stars = calculateStars();
    await saveGameProgress(gameId, levelNumber, stars, score);
    
    // FIXED: Navigate to CandyCatchResult instead of GameResult
    navigation.replace('CandyCatchResult', {
      score,
      targetScore: targetScoreValue,
      stars,
      levelNumber,
      gameId: 'candy_catch',
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
          <View style={styles.starsContainer}>
            {[1, 2, 3].map(star => (
              <Text key={star} style={styles.star}>
                {star <= stars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.playAgainBtn}
            onPress={() => navigation.replace('CandyCatch', { levelNumber, gameId })}
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
      <TouchableOpacity style={styles.musicButton} onPress={toggleMusic}>
        <Text style={styles.musicButtonText}>
          {isMusicMuted ? '🔇' : '🔊'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
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
            <Text style={styles.comboText}>🔥 {Math.floor(combo)}x COMBO! 🔥</Text>
          </View>
        )}
        
        <View style={styles.missBox}>
          <Text style={styles.missText}>💔 Misses: {missedCandies}/8</Text>
          <View style={styles.missBarBg}>
            <View style={[styles.missBarFill, { width: `${(missedCandies / 8) * 100}%` }]} />
          </View>
        </View>
      </View>
      
      <View style={styles.gameArea}>
        {candies.map(candy => (
          <TouchableWithoutFeedback
            key={candy.id}
            onPress={() => handleCandyTap(candy, candy.id)}
          >
            <Animated.View
              style={[
                styles.candy,
                {
                  left: candy.x,
                  top: candy.y,
                  width: candy.size,
                  height: candy.size,
                  transform: [
                    {
                      rotate: candy.rotation?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }) || '0deg'
                    },
                    {
                      scale: candy.scale || 1
                    }
                  ]
                }
              ]}
            >
              <LinearGradient colors={[candy.color, candy.color + 'CC']} style={styles.candyInner}>
                <Text style={styles.candyEmoji}>{candy.emoji}</Text>
                <Text style={styles.candyValue}>+{candy.value}</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        ))}
        
        {tapEffect && (
          <Animated.Text 
            style={[styles.tapEffect, { left: tapEffect.x - 20, top: tapEffect.y - 20 }]}
          >
            ✨ POP! ✨
          </Animated.Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  musicButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  musicButtonText: {
    fontSize: 24,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
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
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
    minWidth: 80,
  },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 11, color: '#FFF' },
  warning: { color: '#FF4444' },
  comboBox: {
    alignItems: 'center',
    marginVertical: 5,
  },
  comboText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  missBox: {
    marginTop: 5,
  },
  missText: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
  },
  missBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  missBarFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 3,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  candy: {
    position: 'absolute',
    zIndex: 10,
  },
  candyInner: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  candyEmoji: { fontSize: 28 },
  candyValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  tapEffect: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 20,
  },
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