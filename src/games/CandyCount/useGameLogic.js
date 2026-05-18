// src/games/CandyCount/useGameLogic.js
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';

// Game configuration by level
const getLevelConfig = (level) => ({
  timeLimit: Math.max(30, 60 - Math.floor(level / 2)),
  targetScore: 50 + (level * 10),
  minNumber: 1,
  maxNumber: Math.min(20, 5 + Math.floor(level / 5)),
  penalty: 5,
  reward: 10,
  maxWrongAnswers: 8,
});

export const useCandyCountLogic = (levelNumber = 1, customTimeLimit, customTargetScore) => {
  const config = getLevelConfig(levelNumber);
  
  // CRITICAL FIX: ALWAYS use customTargetScore if provided, NEVER use config.targetScore
  // The config.targetScore is just a fallback, but we should use what's passed from LevelSelectScreen
  const targetScoreValue = customTargetScore !== undefined ? customTargetScore : config.targetScore;
  
  console.log('=== CRITICAL DEBUG ===');
  console.log('Level:', levelNumber);
  console.log('customTargetScore from params:', customTargetScore);
  console.log('config.targetScore (calculated):', config.targetScore);
  console.log('USING targetScoreValue:', targetScoreValue);
  
  const maxWrongAnswers = config.maxWrongAnswers;
  
  // Game states
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(customTimeLimit || config.timeLimit);
  const [gameActive, setGameActive] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(3);
  const [options, setOptions] = useState([2, 3, 4, 5]);
  const [combo, setCombo] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  
  // Sound refs
  const correctSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [soundsReady, setSoundsReady] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Refs
  const comboTimeout = useRef(null);
  const feedbackTimeout = useRef(null);
  const timerRef = useRef(null);
  
  // Calculate stars based on score percentage of target
  const calculateStars = useCallback((currentScore, target) => {
    if (target === 0) return 0;
    const percentage = currentScore / target;
    console.log(`=== STAR CALCULATION ===`);
    console.log(`Score: ${currentScore}, Target: ${target}, Percentage: ${(percentage * 100).toFixed(1)}%`);
    
    if (percentage >= 1.5) {
      console.log('⭐ RESULT: 3 STARS! (150% or more of target)');
      return 3;
    }
    if (percentage >= 1.0) {
      console.log('⭐⭐ RESULT: 2 STARS! (100% or more of target)');
      return 2;
    }
    if (percentage >= 0.7) {
      console.log('⭐ RESULT: 1 STAR! (70% or more of target)');
      return 1;
    }
    console.log('⭐ RESULT: 0 STARS! (Less than 70% of target)');
    return 0;
  }, []);
  
  // End game function
  const endGame = useCallback((isWin = false) => {
    console.log('=== END GAME ===');
    console.log('Final score:', score);
    console.log('Target score being used:', targetScoreValue);
    
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (comboTimeout.current) {
      clearTimeout(comboTimeout.current);
      comboTimeout.current = null;
    }
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
    
    // Calculate stars based on final score and target
    const stars = calculateStars(score, targetScoreValue);
    console.log('Final stars earned:', stars);
    
    setStarsEarned(stars);
    setGameActive(false);
    setIsGameComplete(true);
  }, [score, targetScoreValue, calculateStars]);
  
  // Load sounds (keep your existing sound code)
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
  const playCorrectSound = useCallback(async () => {
    if (!soundsReady || !correctSoundRef.current) return;
    try {
      const status = await correctSoundRef.current.getStatusAsync();
      if (status.isLoaded) {
        await correctSoundRef.current.setPositionAsync(0);
        await correctSoundRef.current.playAsync();
      }
    } catch (error) {}
  }, [soundsReady]);
  
  // Generate question
  const generateQuestion = useCallback(() => {
    const maxNum = config.maxNumber;
    const minNum = config.minNumber;
    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    setCurrentNumber(num);
    
    const wrongOptions = new Set();
    wrongOptions.add(num + 1 > maxNum ? num - 1 : num + 1);
    wrongOptions.add(num + 2 > maxNum ? num - 2 : num + 2);
    wrongOptions.add(Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
    
    const newOptions = [num, ...Array.from(wrongOptions).slice(0, 3)];
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [config.maxNumber, config.minNumber]);
  
  // Initialize first question
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);
  
  // Handle answer
  const handleAnswer = useCallback(async (answer) => {
    if (!gameActive) return false;
    
    const isCorrect = answer === currentNumber;
    
    if (isCorrect) {
      await playCorrectSound();
      
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      setCombo(prev => prev + 1);
      
      const currentCombo = combo + 1;
      const bonus = Math.floor(config.reward * (currentCombo * 0.1));
      const totalGain = config.reward + bonus;
      
      const newScore = score + totalGain;
      setScore(newScore);
      setCorrectAnswers(prev => prev + 1);
      
      setFeedback({ message: `+${totalGain} 🎉 Correct!`, isCorrect: true });
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 1000);
      
      if (Platform.OS !== 'web') Vibration.vibrate(50);
      
      // Check win condition using targetScoreValue
      if (newScore >= targetScoreValue) {
        console.log('WIN CONDITION MET! Score:', newScore, 'Target:', targetScoreValue);
        endGame(true);
        return true;
      }
      
      generateQuestion();
      
      comboTimeout.current = setTimeout(() => {
        setCombo(prev => Math.max(0, prev - 1));
      }, 2000);
      
    } else {
      const newWrong = wrongAnswers + 1;
      setWrongAnswers(newWrong);
      
      // Check loss condition
      if (newWrong >= maxWrongAnswers) {
        console.log('LOSS CONDITION MET! Wrong answers:', newWrong);
        endGame(false);
        return true;
      }
      
      setCombo(0);
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      setScore(prev => Math.max(0, prev - config.penalty));
      
      setFeedback({ message: `-${config.penalty} ❌ Wrong! The answer was ${currentNumber}`, isCorrect: false });
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 1000);
      
      if (Platform.OS !== 'web') Vibration.vibrate(100);
    }
    
    return true;
  }, [gameActive, currentNumber, combo, score, wrongAnswers, config, targetScoreValue, maxWrongAnswers, playCorrectSound, generateQuestion, endGame]);
  
  // Timer
  useEffect(() => {
    if (!gameActive || isGameComplete) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log('TIME RAN OUT!');
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, isGameComplete, endGame]);
  
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
    setCombo(0);
    setWrongAnswers(0);
    setCorrectAnswers(0);
    setFeedback(null);
    setIsGameComplete(false);
    setStarsEarned(0);
    
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    generateQuestion();
  }, [config.timeLimit, customTimeLimit, generateQuestion]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  return {
    score,
    timeLeft,
    gameActive,
    currentNumber,
    options,
    combo,
    wrongAnswers,
    correctAnswers,
    feedback,
    isGameComplete,
    starsEarned,
    targetScore: targetScoreValue,
    maxWrongAnswers,
    config,
    handleAnswer,
    toggleMusic,
    resetGame,
    isMusicMuted,
    soundsReady,
  };
};