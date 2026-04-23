// src/games/CandyCatch/GameScreen.js
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
  spawnRate: 900,
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
  const [sparkles, setSparkles] = useState([]);
  const [basketGlow, setBasketGlow] = useState(false);
  
  // Refs for animations and intervals
  const spawnInterval = useRef(null);
  const animationFrame = useRef(null);
  const basketX = useRef(SCREEN_WIDTH / 2 - 50);
  const basketAnim = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 50)).current;
  const lastTimestamp = useRef(0);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  
  // Candy types with emojis and values
  const candyTypes = [
    { emoji: '🍬', value: 10, size: 45, color: '#FF6B6B' },
    { emoji: '🍭', value: 15, size: 50, color: '#FF8E8E' },
    { emoji: '🍫', value: 20, size: 55, color: '#8B4513' },
    { emoji: '🍪', value: 25, size: 50, color: '#D2691E' },
    { emoji: '🍩', value: 30, size: 60, color: '#FFB6C1' },
    { emoji: '🍰', value: 35, size: 65, color: '#FF69B4' },
  ];
  
  // Spawn a new candy
  const spawnCandy = () => {
    const candyType = candyTypes[Math.floor(Math.random() * candyTypes.length)];
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - candyType.size),
      y: -candyType.size,
      ...candyType,
      rotation: new Animated.Value(0),
    };
  };
  
  // Start spawning candies
  useEffect(() => {
    if (!gameActive) return;
    
    spawnInterval.current = setInterval(() => {
      setCandies(prev => [...prev, spawnCandy()]);
    }, config.spawnRate);
    
    return () => {
      if (spawnInterval.current) clearInterval(spawnInterval.current);
    };
  }, [gameActive, config.spawnRate]);
  
  // Apply rotation animations to new candies
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
      }
    });
  }, [candies]);
  
  // Add sparkle effect
  const addSparkle = (x, y) => {
    const id = Date.now() + Math.random();
    setSparkles(prev => [...prev, { id, x, y, emoji: '✨' }]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 300);
  };
  
  // Main animation loop with collision detection
  useEffect(() => {
    if (!gameActive) return;
    
    const animate = (timestamp) => {
      if (!lastTimestamp.current) {
        lastTimestamp.current = timestamp;
        animationFrame.current = requestAnimationFrame(animate);
        return;
      }
      
      // Move candies at consistent speed (60fps)
      const delta = Math.min(32, timestamp - lastTimestamp.current);
      if (delta >= 16) { // Update every frame
        setCandies(prevCandies => {
          const remainingCandies = [];
          const basketLeft = basketX.current;
          const basketRight = basketX.current + 100;
          const basketTop = SCREEN_HEIGHT - 110;
          const basketBottom = SCREEN_HEIGHT - 30;
          
          let caughtAny = false;
          let newCombo = combo;
          
          for (const candy of prevCandies) {
            // Update candy position with frame-independent movement
            const newY = candy.y + (config.fallSpeed * (delta / 16));
            const candyLeft = candy.x;
            const candyRight = candy.x + candy.size;
            const candyTop = newY;
            const candyBottom = newY + candy.size;
            
            // Check collision with basket (more precise)
            const colliding = candyBottom >= basketTop && 
                             candyTop <= basketBottom &&
                             candyRight > basketLeft && 
                             candyLeft < basketRight;
            
            if (colliding && newY + candy.size >= basketTop) {
              // CATCH! Candy caught by basket
              caughtAny = true;
              if (Platform.OS !== 'web') Vibration.vibrate(30);
              
              // Update combo
              newCombo = combo + 1;
              
              // Calculate score with combo bonus
              const bonus = Math.floor(candy.value * (newCombo * 0.1));
              const totalGain = candy.value + bonus;
              
              setScore(prev => prev + totalGain);
              
              // Visual effects
              setBasketGlow(true);
              addSparkle(candy.x + candy.size/2, basketTop);
              
              setTimeout(() => setBasketGlow(false), 150);
              // Candy caught - do NOT add to remaining
            } 
            else if (candyBottom >= SCREEN_HEIGHT) {
              // MISS! Candy fell past basket
              setMissedCandies(prev => {
                const newMissed = prev + 1;
                if (newMissed >= 8) setGameActive(false);
                return newMissed;
              });
              newCombo = 0;
              // Candy missed - do NOT add to remaining
            } 
            else {
              // Candy still falling
              remainingCandies.push({ ...candy, y: newY });
            }
          }
          
          // Update combo after processing all candies
          if (caughtAny) {
            setCombo(newCombo);
          } else if (prevCandies.length > 0 && !caughtAny) {
            // Reset combo if no candy caught in this frame and there were candies
            // But don't reset if candies are just falling
            const anyNearBottom = prevCandies.some(c => c.y + c.size > SCREEN_HEIGHT - 150);
            if (!anyNearBottom) {
              setCombo(0);
            }
          }
          
          return remainingCandies;
        });
        
        lastTimestamp.current = timestamp;
      }
      
      animationFrame.current = requestAnimationFrame(animate);
    };
    
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [gameActive, config.fallSpeed, combo]);
  
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
  
  // Save progress
  const saveAndExit = async () => {
    const stars = calculateStars();
    await saveGameProgress(gameId, levelNumber, stars, score);
    
    navigation.replace('GameResult', {
      score,
      targetScore: targetScoreValue,
      stars,
      levelNumber,
      gameId,
      isWin: score >= targetScoreValue,
    });
  };
  
  useEffect(() => {
    if (!gameActive) {
      saveAndExit();
    }
  }, [gameActive]);
  
  // Touch handlers for basket movement - FIXED
  const handleTouchMove = (evt) => {
    const locationX = evt.nativeEvent.locationX;
    let newX = locationX - 50;
    newX = Math.max(0, Math.min(SCREEN_WIDTH - 100, newX));
    basketX.current = newX;
    basketAnim.setValue(newX);
  };
  
  const handleTouchStart = (evt) => {
    const locationX = evt.nativeEvent.locationX;
    let newX = locationX - 50;
    newX = Math.max(0, Math.min(SCREEN_WIDTH - 100, newX));
    basketX.current = newX;
    basketAnim.setValue(newX);
  };
  
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
          <Text style={styles.resultStars}>
            {stars === 3 ? '🌟🌟🌟' : stars === 2 ? '🌟🌟' : stars === 1 ? '🌟' : '☆☆☆'}
          </Text>
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
    <TouchableWithoutFeedback onPressIn={handleTouchStart}>
      <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
        {/* Header */}
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
          
          {combo > 1 && (
            <View style={styles.comboBox}>
              <Text style={styles.comboText}>🔥 {combo}x COMBO! +{combo * 10}% 🔥</Text>
            </View>
          )}
          
          <View style={styles.missBox}>
            <Text style={styles.missText}>💔 Misses: {missedCandies}/8</Text>
            <View style={styles.missBarBg}>
              <View style={[styles.missBarFill, { width: `${(missedCandies / 8) * 100}%` }]} />
            </View>
          </View>
        </View>
        
        {/* Game Area */}
        <View 
          style={styles.gameArea}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
          {/* Falling Candies */}
          {candies.map(candy => (
            <Animated.View
              key={candy.id}
              style={[
                styles.candy,
                {
                  left: candy.x,
                  top: candy.y,
                  width: candy.size,
                  height: candy.size,
                  transform: [{
                    rotate: candy.rotation?.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }) || '0deg'
                  }]
                }
              ]}
              pointerEvents="none"
            >
              <LinearGradient colors={[candy.color, candy.color + 'CC']} style={styles.candyInner}>
                <Text style={styles.candyEmoji}>{candy.emoji}</Text>
                <Text style={styles.candyValue}>+{candy.value}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
          
          {/* Sparkles */}
          {sparkles.map(s => (
            <Text key={s.id} style={[styles.sparkle, { left: s.x - 15, top: s.y - 15 }]}>{s.emoji}</Text>
          ))}
          
          {/* Basket */}
          <Animated.View 
            style={[styles.basket, { transform: [{ translateX: basketAnim }] }, basketGlow && styles.basketGlow]}
            pointerEvents="none"
          >
            <LinearGradient colors={basketGlow ? ['#FFD700', '#FFA500'] : ['#8B4513', '#A0522D']} style={styles.basketInner}>
              <Text style={styles.basketEmoji}>🧺</Text>
              <Text style={styles.basketLabel}>CATCH!</Text>
            </LinearGradient>
          </Animated.View>
          
      
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  },
  candyEmoji: { fontSize: 24 },
  candyValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    zIndex: 20,
  },
  basket: {
    position: 'absolute',
    bottom: 20,
    width: 100,
    height: 85,
    zIndex: 15,
  },
  basketGlow: {
    transform: [{ scale: 1.1 }],
  },
  basketInner: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  basketEmoji: { fontSize: 40 },
  basketLabel: { fontSize: 9, fontWeight: 'bold', color: '#FFD700', marginTop: 2 },
  instruction: {
    textAlign: 'center',
    fontSize: 12,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    margin: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
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
  resultStars: {
    fontSize: 48,
    marginBottom: 30,
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