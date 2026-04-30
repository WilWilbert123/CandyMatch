// src/games/CandyPop/GameScreen.js
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { saveGameProgress } from '../../shared/utils/globalStorage';
import { candyTheme } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Balloon colors and emojis
const BALLOONS = [
  { emoji: '🎈', candyEmoji: '🍬', color: '#FF6B6B', name: 'Candy Balloon' },
  { emoji: '🎈', candyEmoji: '🍭', color: '#FF69B4', name: 'Lollipop Balloon' },
  { emoji: '🎈', candyEmoji: '🍫', color: '#8B4513', name: 'Chocolate Balloon' },
  { emoji: '🎈', candyEmoji: '🍪', color: '#D2691E', name: 'Cookie Balloon' },
  { emoji: '🎈', candyEmoji: '🍩', color: '#FFB6C1', name: 'Donut Balloon' },
  { emoji: '🎈', candyEmoji: '🍰', color: '#FF69B4', name: 'Cake Balloon' },
];

// Game configuration
const getGameConfig = (level) => ({
  timeLimit: Math.max(20, 45 - Math.floor(level / 3)),
  targetScore: 100 + (level * 15),
  spawnRate: 800,
  balloonSpeed: 3,
});

export default function CandyPopGame({ navigation, route }) {
  const { 
    levelNumber = 1, 
    gameId = 'candy_pop',
    timeLimit: customTimeLimit,
    targetScore: customTargetScore,
  } = route.params || {};
  
  const config = getGameConfig(levelNumber);
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [balloons, setBalloons] = useState([]);
  const [combo, setCombo] = useState(0);
  const [missedBalloons, setMissedBalloons] = useState(0);
  const [popEffect, setPopEffect] = useState(null);
  
  // Sound refs
  const popSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Refs
  const spawnInterval = useRef(null);
  const gameLoopInterval = useRef(null);
  const comboTimeout = useRef(null);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  const maxMissedBalloons = 10;
  
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
        
        const { sound: popSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/pop.mp3')
        );
        popSoundRef.current = popSound;
        
        setSoundsReady(true);
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };
    
    loadSounds();
    
    return () => {
      if (bgMusicRef.current) bgMusicRef.current.unloadAsync();
      if (popSoundRef.current) popSoundRef.current.unloadAsync();
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
  
  // Play pop sound
  const playPopSound = async () => {
    if (!soundsReady || !popSoundRef.current) return;
    try {
      const status = await popSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await popSoundRef.current.setPositionAsync(0);
        await popSoundRef.current.playAsync();
      }
    } catch (error) {}
  };
  
  // Spawn balloon
  const spawnBalloon = () => {
    const randomBalloon = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - 100),
      y: SCREEN_HEIGHT - 150,
      ...randomBalloon,
      scale: new Animated.Value(1),
      floatAnim: new Animated.Value(0),
    };
  };
  
  // Start spawning
  useEffect(() => {
    if (!gameActive) return;
    
    spawnInterval.current = setInterval(() => {
      setBalloons(prev => [...prev, spawnBalloon()]);
    }, config.spawnRate);
    
    return () => {
      if (spawnInterval.current) clearInterval(spawnInterval.current);
    };
  }, [gameActive, config.spawnRate]);
  
  // Animate balloons floating up
  useEffect(() => {
    balloons.forEach(balloon => {
      if (balloon.floatAnim && !balloon.floatAnim._animation) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(balloon.floatAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(balloon.floatAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [balloons]);
  
  // Pop balloon effect
  const addPopEffect = (x, y) => {
    const id = Date.now() + Math.random();
    setPopEffect({ id, x, y });
    setTimeout(() => {
      setPopEffect(prev => prev?.id === id ? null : prev);
    }, 300);
  };
  
  // Handle balloon pop
  const handlePopBalloon = async (balloon, balloonId) => {
    if (!gameActive) return;
    
    const balloonToPop = balloons.find(b => b.id === balloonId);
    if (!balloonToPop) return;
    
    // Play pop sound
    await playPopSound();
    
    // Add pop effect
    addPopEffect(balloonToPop.x + 50, balloonToPop.y);
    
    // Remove balloon
    setBalloons(prev => prev.filter(b => b.id !== balloonId));
    
    // Update combo
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    setCombo(prev => prev + 1);
    
    // Calculate score with combo bonus
    const currentCombo = combo + 1;
    const basePoints = 10;
    const bonus = Math.floor(basePoints * (currentCombo * 0.15));
    const totalGain = basePoints + bonus;
    
    setScore(prev => prev + totalGain);
    
    // Vibration feedback
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    
    // Set combo decay
    comboTimeout.current = setTimeout(() => {
      setCombo(prev => Math.max(0, prev - 1));
    }, 2000);
  };
  
  // Main game loop - move balloons up
  useEffect(() => {
    if (!gameActive) return;
    
    gameLoopInterval.current = setInterval(() => {
      setBalloons(prevBalloons => {
        const remainingBalloons = [];
        
        for (const balloon of prevBalloons) {
          const newY = balloon.y - config.balloonSpeed;
          
          if (newY + 100 <= 0) {
            // Balloon missed - floated off screen
            setMissedBalloons(prev => {
              const newMissed = prev + 1;
              if (newMissed >= maxMissedBalloons) {
                setGameActive(false);
              }
              return newMissed;
            });
            setCombo(0);
            if (comboTimeout.current) clearTimeout(comboTimeout.current);
          } else {
            remainingBalloons.push({ ...balloon, y: newY });
          }
        }
        
        return remainingBalloons;
      });
    }, 1000 / 60);
    
    return () => {
      if (gameLoopInterval.current) clearInterval(gameLoopInterval.current);
    };
  }, [gameActive, config.balloonSpeed]);
  
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
    
    navigation.replace('CandyPopResult', {
      score,
      targetScore: targetScoreValue,
      stars,
      levelNumber,
      gameId: 'candy_pop',
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
            onPress={() => navigation.replace('CandyPop', { levelNumber, gameId })}
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.badgeText}>Level {levelNumber}</Text>
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
            <Text style={styles.statLabel}>Left</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={[styles.statValue, timeLeft <= 5 && styles.warning]}>{timeLeft}s</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
        
        {combo > 1 && (
          <View style={styles.comboBox}>
            <Text style={styles.comboText}>🔥 {combo}x COMBO! +{combo * 15}% 🔥</Text>
          </View>
        )}
        
        <View style={styles.missContainer}>
          <View style={styles.missBarBg}>
            <View style={[styles.missBarFill, { width: `${(missedBalloons / maxMissedBalloons) * 100}%` }]} />
          </View>
          <Text style={styles.missText}>💔 Missed: {missedBalloons}/{maxMissedBalloons}</Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          🎈 POP THE CANDY BALLOONS! 🎈
        </Text>
        
        {/* Balloons */}
        {balloons.map(balloon => (
          <Animated.View
            key={balloon.id}
            style={[
              styles.balloonContainer,
              {
                left: balloon.x,
                top: balloon.y,
                transform: [
                  {
                    translateY: balloon.floatAnim?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }) || 0
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.balloonButton}
              onPress={() => handlePopBalloon(balloon, balloon.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[balloon.color, balloon.color + 'CC']}
                style={styles.balloonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.balloonEmoji}>{balloon.emoji}</Text>
                <Text style={styles.candyEmoji}>{balloon.candyEmoji}</Text>
                <Text style={styles.popHint}>💥 POP!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        {/* Pop Effect */}
        {popEffect && (
          <Animated.Text 
            style={[styles.popEffect, { left: popEffect.x, top: popEffect.y }]}
          >
            💥 POP! 💥
          </Animated.Text>
        )}
        
        {/* Instructions at bottom */}
        <View style={styles.bottomInstruction}>
          <Text style={styles.bottomInstructionText}>
            👆 Tap on balloons to pop them! 👆
          </Text>
        </View>
      </View>
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
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 16,
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
  comboBox: {
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
  
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  instruction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  balloonContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  balloonButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balloonGradient: {
    width: 100,
    height: 120,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  balloonEmoji: { fontSize: 45, position: 'absolute', top: 15 },
  candyEmoji: { fontSize: 35, marginTop: 35 },
  popHint: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 8,
  },
  
  popEffect: {
    position: 'absolute',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 20,
  },
  
  bottomInstruction: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomInstructionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
    overflow: 'hidden',
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
    marginBottom: 10,
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