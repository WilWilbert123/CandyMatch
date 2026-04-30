// src/games/CandyPop/useGameLogic.js
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, Vibration } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Balloon colors and emojis with different point values
const BALLOONS = [
  { emoji: '🎈', candyEmoji: '🍬', color: '#FF6B6B', name: 'Candy Balloon', value: 10 },
  { emoji: '🎈', candyEmoji: '🍭', color: '#FF69B4', name: 'Lollipop Balloon', value: 10 },
  { emoji: '🎈', candyEmoji: '🍫', color: '#8B4513', name: 'Chocolate Balloon', value: 15 },
  { emoji: '🎈', candyEmoji: '🍪', color: '#D2691E', name: 'Cookie Balloon', value: 15 },
  { emoji: '🎈', candyEmoji: '🍩', color: '#FFB6C1', name: 'Donut Balloon', value: 20 },
  { emoji: '🎈', candyEmoji: '🍰', color: '#FF69B4', name: 'Cake Balloon', value: 25 },
];

// Special golden balloon for bonus
const GOLDEN_BALLOON = { emoji: '🎈', candyEmoji: '⭐', color: '#FFD700', name: 'Golden Balloon', value: 50, isGolden: true };

// Game configuration by level
const getLevelConfig = (level) => ({
  timeLimit: Math.max(20, 45 - Math.floor(level / 3)),
  targetScore: 100 + (level * 15),
  spawnRate: Math.max(500, 1000 - Math.floor(level / 2) * 20),
  balloonSpeed: Math.min(6, 3 + Math.floor(level / 10)),
  maxMissedBalloons: 10,
  basePoints: 10,
  goldenChance: Math.min(0.15, 0.05 + Math.floor(level / 20) * 0.02), // Up to 15% chance for golden balloon
});

export const useCandyPopLogic = (levelNumber = 1, customTimeLimit, customTargetScore) => {
  const config = getLevelConfig(levelNumber);
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [balloons, setBalloons] = useState([]);
  const [combo, setCombo] = useState(0);
  const [missedBalloons, setMissedBalloons] = useState(0);
  const [popEffect, setPopEffect] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [balloonsPopped, setBalloonsPopped] = useState(0);
  
  // Sound refs
  const popSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const goldenSoundRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Refs
  const spawnInterval = useRef(null);
  const gameLoopInterval = useRef(null);
  const comboTimeout = useRef(null);
  const timerRef = useRef(null);
  const frameRef = useRef(0);
  
  const targetScoreValue = customTargetScore || config.targetScore;
  const maxMissedBalloons = config.maxMissedBalloons;
  
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
      if (goldenSoundRef.current) goldenSoundRef.current.unloadAsync();
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
  const playPopSound = useCallback(async () => {
    if (!soundsReady || !popSoundRef.current) return;
    try {
      const status = await popSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await popSoundRef.current.setPositionAsync(0);
        await popSoundRef.current.playAsync();
      }
    } catch (error) {}
  }, [soundsReady]);
  
  // Spawn balloon (regular or golden)
  const spawnBalloon = useCallback(() => {
    const isGolden = Math.random() < config.goldenChance;
    const balloonType = isGolden ? GOLDEN_BALLOON : BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
    
    return {
      id: Date.now() + Math.random() + frameRef.current++,
      x: Math.random() * (SCREEN_WIDTH - 100),
      y: SCREEN_HEIGHT - 150,
      ...balloonType,
      floatOffset: Math.random() * Math.PI * 2,
      startY: SCREEN_HEIGHT - 150,
      createdAt: Date.now(),
    };
  }, [config.goldenChance]);
  
  // Add pop effect
  const addPopEffect = useCallback((x, y, isGolden = false) => {
    const id = Date.now() + Math.random();
    setPopEffect({ id, x, y, isGolden });
    setTimeout(() => {
      setPopEffect(prev => prev?.id === id ? null : prev);
    }, 300);
  }, []);
  
  // Pop balloon
  const popBalloon = useCallback(async (balloonId, tapX, tapY) => {
    if (!gameActive) return false;
    
    const balloonToPop = balloons.find(b => b.id === balloonId);
    if (!balloonToPop) return false;
    
    await playPopSound();
    addPopEffect(tapX || balloonToPop.x + 50, tapY || balloonToPop.y + 50, balloonToPop.isGolden);
    
    setBalloons(prev => prev.filter(b => b.id !== balloonId));
    setBalloonsPopped(prev => prev + 1);
    
    // Update combo
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    setCombo(prev => prev + 1);
    
    // Calculate score with combo bonus
    const currentCombo = combo + 1;
    const bonus = Math.floor(balloonToPop.value * (currentCombo * 0.15));
    const totalGain = balloonToPop.value + bonus;
    
    setScore(prev => prev + totalGain);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      if (balloonToPop.isGolden) {
        Vibration.vibrate([0, 100, 50, 100]); // Special pattern for golden
      } else {
        Vibration.vibrate(30);
      }
    }
    
    // Set combo decay
    comboTimeout.current = setTimeout(() => {
      setCombo(prev => Math.max(0, prev - 1));
    }, 2000);
    
    return true;
  }, [gameActive, balloons, combo, playPopSound, addPopEffect]);
  
  // Update balloon positions with smooth animation
  const updateBalloonPositions = useCallback(() => {
    setBalloons(prevBalloons => {
      const newBalloons = [];
      let missed = 0;
      
      for (const balloon of prevBalloons) {
        const newY = balloon.y - config.balloonSpeed;
        
        if (newY + 100 <= 0) {
          missed++;
        } else {
          newBalloons.push({ ...balloon, y: newY });
        }
      }
      
      if (missed > 0) {
        setMissedBalloons(prev => {
          const newMissed = prev + missed;
          if (newMissed >= maxMissedBalloons) {
            setGameActive(false);
            setIsGameComplete(true);
          }
          return newMissed;
        });
        setCombo(0);
        if (comboTimeout.current) clearTimeout(comboTimeout.current);
      }
      
      return newBalloons;
    });
  }, [config.balloonSpeed, maxMissedBalloons]);
  
  // Spawn balloons periodically
  useEffect(() => {
    if (!gameActive) return;
    
    spawnInterval.current = setInterval(() => {
      setBalloons(prev => [...prev, spawnBalloon()]);
    }, config.spawnRate);
    
    return () => {
      if (spawnInterval.current) clearInterval(spawnInterval.current);
    };
  }, [gameActive, config.spawnRate, spawnBalloon]);
  
  // Game loop - move balloons
  useEffect(() => {
    if (!gameActive) return;
    
    gameLoopInterval.current = setInterval(() => {
      updateBalloonPositions();
    }, 1000 / 60);
    
    return () => {
      if (gameLoopInterval.current) clearInterval(gameLoopInterval.current);
    };
  }, [gameActive, updateBalloonPositions]);
  
  // Timer
  useEffect(() => {
    if (!gameActive || isGameComplete) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameActive(false);
          setIsGameComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, isGameComplete]);
  
  // Win condition
  useEffect(() => {
    if (score >= targetScoreValue && gameActive) {
      setGameActive(false);
      setIsGameComplete(true);
    }
  }, [score, targetScoreValue, gameActive]);
  
  // Calculate stars
  useEffect(() => {
    if (isGameComplete && starsEarned === 0) {
      const percentage = score / targetScoreValue;
      let stars = 0;
      if (percentage >= 1.5) stars = 3;
      else if (percentage >= 1.0) stars = 2;
      else if (percentage >= 0.7) stars = 1;
      setStarsEarned(stars);
    }
  }, [isGameComplete, score, targetScoreValue, starsEarned]);
  
  // Toggle music
  const toggleMusic = useCallback(async () => {
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
  }, [soundsReady, isMusicMuted]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(customTimeLimit || config.timeLimit);
    setGameActive(true);
    setBalloons([]);
    setCombo(0);
    setMissedBalloons(0);
    setPopEffect(null);
    setIsGameComplete(false);
    setStarsEarned(0);
    setBalloonsPopped(0);
    
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    if (spawnInterval.current) clearInterval(spawnInterval.current);
    if (gameLoopInterval.current) clearInterval(gameLoopInterval.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [config.timeLimit, customTimeLimit]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      if (spawnInterval.current) clearInterval(spawnInterval.current);
      if (gameLoopInterval.current) clearInterval(gameLoopInterval.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Get balloon animation transform
  const getBalloonTransform = useCallback((balloon) => {
    const floatY = Math.sin(Date.now() * 0.003 + balloon.floatOffset) * 5;
    return {
      transform: [{ translateY: floatY }]
    };
  }, []);
  
  return {
    // Game data
    score,
    timeLeft,
    gameActive,
    balloons,
    combo,
    missedBalloons,
    popEffect,
    isGameComplete,
    starsEarned,
    targetScore: targetScoreValue,
    maxMissedBalloons,
    balloonsPopped,
    
    // Game functions
    popBalloon,
    toggleMusic,
    resetGame,
    getBalloonTransform,
    
    // Sound state
    isMusicMuted,
    soundsReady,
    
    // Configuration
    config,
    BALLOONS,
    GOLDEN_BALLOON,
  };
};