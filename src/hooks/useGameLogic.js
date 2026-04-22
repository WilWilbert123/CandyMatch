import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { LEVELS, getThemeForLevel } from '../data/levels';

export const useGameLogic = (levelNumber = 1) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  
  const levelConfig = LEVELS[levelNumber - 1];
  const theme = getThemeForLevel(levelNumber);
  
  // Timer for level time limit
  useEffect(() => {
    if (levelConfig.timeLimit && !isGameComplete && cards.length > 0 && !isPreviewMode) {
      setTimeLeft(levelConfig.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsGameComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [levelConfig.timeLimit, isGameComplete, cards.length, isPreviewMode]);
  
  const initializeGame = useCallback(() => {
    const selectedEmojis = [];
    for (let i = 0; i < levelConfig.pairsCount; i++) {
      selectedEmojis.push(theme.emojis[i % theme.emojis.length]);
      selectedEmojis.push(theme.emojis[i % theme.emojis.length]);
    }
    
    for (let i = selectedEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedEmojis[i], selectedEmojis[j]] = [selectedEmojis[j], selectedEmojis[i]];
    }
    
    const shuffledCards = selectedEmojis.map((emoji, index) => ({
      id: index,
      emoji: emoji,
    }));
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setScore(0);
    setMoves(0);
    setIsGameComplete(false);
    setStarsEarned(0);
    setIsProcessing(false);
    setIsPreviewMode(true);
    
    if (levelConfig.timeLimit) {
      setTimeLeft(levelConfig.timeLimit);
    }
    
    // Show all cards for preview
    const allIndices = shuffledCards.map((_, index) => index);
    setFlippedIndices(allIndices);
    
    // After 3 seconds, hide all cards
    setTimeout(() => {
      setFlippedIndices([]);
      setIsPreviewMode(false);
    }, 3000);
    
  }, [levelNumber, levelConfig, theme]);
  
  const handleCardPress = useCallback((index) => {
    if (isPreviewMode) return;
    if (isProcessing) return;
    if (matchedIndices.includes(index)) return;
    if (flippedIndices.includes(index)) return;
    if (flippedIndices.length === 2) return;
    if (isGameComplete) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setFlippedIndices(prev => [...prev, index]);
    
    if (flippedIndices.length === 1) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);
      
      const firstCardIndex = flippedIndices[0];
      const secondCardIndex = index;
      
      if (cards[firstCardIndex].emoji === cards[secondCardIndex].emoji) {
        setTimeout(() => {
          setMatchedIndices(prev => [...prev, firstCardIndex, secondCardIndex]);
          setScore(prev => prev + 10);
          setFlippedIndices([]);
          setIsProcessing(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [cards, flippedIndices, matchedIndices, isProcessing, isGameComplete, isPreviewMode]);
  
  useEffect(() => {
    if (matchedIndices.length === levelConfig.pairsCount * 2 && cards.length > 0 && !isGameComplete) {
      let earnedStars = 3;
      if (score < levelConfig.starThresholds.threeStars) earnedStars = 2;
      if (score < levelConfig.starThresholds.twoStars) earnedStars = 1;
      if (score < levelConfig.starThresholds.oneStar) earnedStars = 0;
      
      setStarsEarned(earnedStars);
      setIsGameComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [matchedIndices, score, levelConfig, cards.length, isGameComplete]);
  
  // MAKE SURE TO RETURN isPreviewMode
  return {
    cards,
    flippedIndices,
    matchedIndices,
    score,
    moves,
    timeLeft,
    isGameComplete,
    starsEarned,
    levelConfig,
    theme,
    isPreviewMode,  // ← THIS MUST BE HERE!
    initializeGame,
    handleCardPress,
  };
};