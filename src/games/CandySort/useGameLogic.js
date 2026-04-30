// hooks/useGameLogic.js (Extended for Candy Sort)
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCandySortLogic = (initialTime = 30, targetScore = 100) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameActive, setGameActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const comboTimeoutRef = useRef(null);
  const maxWrongAnswers = 8;

  // Update combo
  const updateCombo = useCallback((isCorrect) => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    
    if (isCorrect) {
      setCombo(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(prev => Math.max(0, prev - 1));
      }, 2000);
    } else {
      setCombo(0);
      setWrongAnswers(prev => {
        const newWrong = prev + 1;
        if (newWrong >= maxWrongAnswers) {
          setGameActive(false);
        }
        return newWrong;
      });
    }
  }, []);

  // Calculate score with combo bonus
  const calculateScore = useCallback((baseValue, isCorrect) => {
    if (!isCorrect) {
      setScore(prev => Math.max(0, prev - 5));
      return;
    }
    
    const currentCombo = combo + 1;
    const bonus = Math.floor(baseValue * (currentCombo * 0.1));
    const totalGain = baseValue + bonus;
    setScore(prev => prev + totalGain);
    return totalGain;
  }, [combo]);

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

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(initialTime);
    setGameActive(true);
    setCombo(0);
    setWrongAnswers(0);
    setCorrectAnswers(0);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
  }, [initialTime]);

  // Check win condition
  const isWin = score >= targetScore && gameActive;
  
  useEffect(() => {
    if (isWin) {
      setGameActive(false);
    }
  }, [isWin, score, targetScore]);

  return {
    score,
    timeLeft,
    gameActive,
    combo,
    wrongAnswers,
    correctAnswers,
    maxWrongAnswers,
    updateCombo,
    calculateScore,
    resetGame,
    isWin,
  };
};