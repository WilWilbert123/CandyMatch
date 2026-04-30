// src/games/CandyMemory/useGameLogic.js
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

// Candy options with colors and emojis
const CANDIES = [
  { emoji: '🍬', color: '#FF69B4', name: 'Candy', sound: 'candy' },
  { emoji: '🍭', color: '#9B59B6', name: 'Lollipop', sound: 'lollipop' },
  { emoji: '🍫', color: '#8B4513', name: 'Chocolate', sound: 'chocolate' },
  { emoji: '🍪', color: '#D2691E', name: 'Cookie', sound: 'cookie' },
  { emoji: '🍩', color: '#FFB6C1', name: 'Donut', sound: 'donut' },
  { emoji: '🍰', color: '#FF69B4', name: 'Cake', sound: 'cake' },
];

// Game configuration by level
const getLevelConfig = (level) => ({
  sequenceSpeed: Math.max(800, 3000 - Math.floor(level / 2) * 100),
  targetScore: 50 + (level * 10),
  timeLimit: Math.max(30, 60 - Math.floor(level / 2)),
  maxMistakes: 3,
  minCandies: 4,
  maxCandies: Math.min(6, 4 + Math.floor(level / 10)),
});

export const useCandyMemoryLogic = (levelNumber = 1) => {
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [round, setRound] = useState(1);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [combo, setCombo] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  
  // Animation states
  const [flashingIndex, setFlashingIndex] = useState(-1);
  const [pulsingIndex, setPulsingIndex] = useState(-1);
  
  // Refs
  const sequenceTimeoutRef = useRef(null);
  const roundTimeoutRef = useRef(null);
  const timerRef = useRef(null);
  
  // Sound refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const sequenceSoundRef = useRef(null);
  
  const config = getLevelConfig(levelNumber);
  const [soundsReady, setSoundsReady] = useState(false);
  
  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
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
      if (correctSoundRef.current) correctSoundRef.current.unloadAsync();
      if (wrongSoundRef.current) wrongSoundRef.current.unloadAsync();
      if (sequenceSoundRef.current) sequenceSoundRef.current.unloadAsync();
    };
  }, []);
  
  // Play correct sound
  const playCorrectSound = useCallback(async () => {
    if (!soundsReady || !correctSoundRef.current) return;
    try {
      await correctSoundRef.current.setPositionAsync(0);
      await correctSoundRef.current.playAsync();
    } catch (error) {}
  }, [soundsReady]);
  
  // Play wrong sound (could use a different sound)
  const playWrongSound = useCallback(async () => {
    if (!soundsReady) return;
    try {
      // You can add a different sound for wrong answers
      if (wrongSoundRef.current) {
        await wrongSoundRef.current.setPositionAsync(0);
        await wrongSoundRef.current.playAsync();
      }
    } catch (error) {}
  }, [soundsReady]);
  
  // Play sequence sound for each candy
  const playSequenceSound = useCallback(async (candyType) => {
    if (!soundsReady) return;
    // Just use correct sound for sequence for now
    await playCorrectSound();
  }, [soundsReady, playCorrectSound]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(config.timeLimit);
    setGameActive(true);
    setSequence([]);
    setUserInput([]);
    setShowSequence(true);
    setRound(1);
    setHighlightedIndex(-1);
    setCombo(0);
    setIsWaiting(false);
    setMistakes(0);
    setIsGameComplete(false);
    setStarsEarned(0);
    setFlashingIndex(-1);
    setPulsingIndex(-1);
    
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [config.timeLimit]);
  
  // Start new round with sequence
  const startRound = useCallback(() => {
    const availableCandies = CANDIES.slice(0, Math.min(config.maxCandies, config.minCandies + Math.floor(round / 5)));
    const newCandy = availableCandies[Math.floor(Math.random() * availableCandies.length)];
    const newSequence = [...sequence, newCandy];
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
        playSequenceSound(newSequence[index].type);
        
        setTimeout(() => {
          setHighlightedIndex(-1);
          setTimeout(() => setPulsingIndex(-1), 100);
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
  }, [sequence, round, config, playSequenceSound]);
  
  // Initialize first round
  useEffect(() => {
    startRound();
  }, []);
  
  // Handle user's candy selection
  const handleCandyPress = useCallback(async (candyIndex) => {
    if (!gameActive || showSequence || isWaiting) return false;
    
    const selectedCandy = CANDIES[candyIndex];
    const expectedCandy = sequence[userInput.length];
    
    // Visual feedback
    setFlashingIndex(candyIndex);
    setTimeout(() => setFlashingIndex(-1), 200);
    
    const newInput = [...userInput, selectedCandy];
    setUserInput(newInput);
    
    if (selectedCandy.emoji !== expectedCandy?.emoji) {
      // Wrong answer
      await playWrongSound();
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= config.maxMistakes) {
          setGameActive(false);
          setIsGameComplete(true);
        }
        return newMistakes;
      });
      setCombo(0);
      return false;
    }
    
    // Correct answer
    await playCorrectSound();
    
    if (newInput.length === sequence.length) {
      // Round complete
      const basePoints = 20;
      const roundBonus = Math.floor(sequence.length * 5);
      const comboBonus = Math.floor((basePoints + roundBonus) * (combo * 0.1));
      const totalGain = basePoints + roundBonus + comboBonus;
      
      setScore(prev => prev + totalGain);
      setCombo(prev => prev + 1);
      setRound(prev => prev + 1);
      
      if (score + totalGain >= config.targetScore) {
        setGameActive(false);
        setIsGameComplete(true);
        // Calculate stars
        const stars = score + totalGain >= config.targetScore * 1.5 ? 3 :
                     score + totalGain >= config.targetScore ? 2 : 1;
        setStarsEarned(stars);
        return true;
      }
      
      setTimeout(() => startRound(), 1000);
      return true;
    }
    
    return true;
  }, [gameActive, showSequence, isWaiting, userInput, sequence, combo, score, config, playCorrectSound, playWrongSound, startRound]);
  
  // Timer effect
  useEffect(() => {
    if (!gameActive || isGameComplete) return;
    
    setTimeLeft(config.timeLimit);
    
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
  }, [gameActive, isGameComplete, config.timeLimit]);
  
  // Calculate stars when game ends
  useEffect(() => {
    if (isGameComplete && starsEarned === 0) {
      const stars = score >= config.targetScore * 1.5 ? 3 :
                   score >= config.targetScore ? 2 :
                   score >= config.targetScore * 0.7 ? 1 : 0;
      setStarsEarned(stars);
    }
  }, [isGameComplete, score, config.targetScore, starsEarned]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  return {
    // Game data
    score,
    timeLeft,
    gameActive,
    sequence,
    userInput,
    showSequence,
    round,
    combo,
    mistakes,
    isGameComplete,
    starsEarned,
    isWaiting,
    
    // Animation states
    highlightedIndex,
    pulsingIndex,
    flashingIndex,
    
    // Game constants
    maxMistakes: config.maxMistakes,
    targetScore: config.targetScore,
    availableCandies: CANDIES.slice(0, config.maxCandies),
    
    // Game functions
    handleCandyPress,
    resetGame,
    startRound,
  };
};