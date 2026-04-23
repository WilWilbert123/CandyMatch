// src/games/CandyMatch/useGameLogic.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVELS, getThemeForLevel } from './levels';

export const useGameLogic = (levelNumber = 1) => {
  // All hooks at the top
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
  
  const flipTimerRef = useRef(null);
  const previewTimerRef = useRef(null);
  const matchTimerRef = useRef(null);
  
  // Get config safely
  const safeLevel = Math.max(1, Math.min(100, levelNumber));
  const levelConfig = LEVELS[safeLevel - 1] || LEVELS[0];
  const theme = getThemeForLevel(safeLevel);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    // Clear existing timers
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    
    // Create card pairs
    const pairsCount = Math.min(levelConfig?.pairsCount || 6, theme?.emojis?.length || 12);
    let cardDeck = [];
    
    // Add pairs
    for (let i = 0; i < pairsCount; i++) {
      const emoji = theme.emojis[i % theme.emojis.length];
      cardDeck.push({ id: i * 2, emoji, isMatched: false });
      cardDeck.push({ id: i * 2 + 1, emoji, isMatched: false });
    }
    
    // Shuffle
    for (let i = cardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
    }
    
    // Reset all state
    setCards(cardDeck);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setScore(0);
    setMoves(0);
    setIsGameComplete(false);
    setStarsEarned(0);
    setIsProcessing(false);
    setIsPreviewMode(true);
    
    if (levelConfig?.timeLimit) {
      setTimeLeft(levelConfig.timeLimit);
    }
    
    // Preview mode - show all cards
    const allIndices = cardDeck.map((_, idx) => idx);
    setFlippedIndices(allIndices);
    
    // Hide cards after preview
    previewTimerRef.current = setTimeout(() => {
      setFlippedIndices([]);
      setIsPreviewMode(false);
    }, 3000);
  }, [levelConfig, theme]);
  
  // Timer effect
  useEffect(() => {
    let timer = null;
    
    if (levelConfig?.timeLimit && !isGameComplete && !isPreviewMode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsGameComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [levelConfig?.timeLimit, isGameComplete, isPreviewMode, timeLeft]);
  
  // Handle card press
  const handleCardPress = useCallback((index) => {
    // Don't allow actions during preview or processing
    if (isPreviewMode) return;
    if (isProcessing) return;
    if (isGameComplete) return;
    if (matchedIndices.includes(index)) return;
    if (flippedIndices.includes(index)) return;
    if (flippedIndices.length >= 2) return;
    
    // Clear any existing match timer
    if (matchTimerRef.current) {
      clearTimeout(matchTimerRef.current);
    }
    
    // Add to flipped
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // Check for match when two cards are flipped
    if (newFlippedIndices.length === 2) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);
      
      const firstIndex = newFlippedIndices[0];
      const secondIndex = newFlippedIndices[1];
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        matchTimerRef.current = setTimeout(() => {
          setMatchedIndices(prev => [...prev, firstIndex, secondIndex]);
          setScore(prev => prev + 10);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 300);
      } else {
        // No match - flip back
        matchTimerRef.current = setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      }
    }
  }, [cards, flippedIndices, matchedIndices, isPreviewMode, isProcessing, isGameComplete]);
  
  // Check for game completion
  useEffect(() => {
    const totalPairs = levelConfig?.pairsCount || 0;
    const matchedPairs = matchedIndices.length;
    
    if (cards.length > 0 && matchedPairs === totalPairs * 2 && !isGameComplete && !isPreviewMode) {
      // Calculate stars
      let earnedStars = 3;
      const maxScore = totalPairs * 10;
      
      if (score < maxScore * 0.7) earnedStars = 2;
      if (score < maxScore * 0.4) earnedStars = 1;
      if (score < maxScore * 0.2) earnedStars = 0;
      
      setStarsEarned(earnedStars);
      setIsGameComplete(true);
      
      // Clear preview timer if exists
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
      if (matchTimerRef.current) {
        clearTimeout(matchTimerRef.current);
      }
    }
  }, [matchedIndices, cards.length, isGameComplete, isPreviewMode, levelConfig, score]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    };
  }, []);
  
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
    isPreviewMode,
    initializeGame,
    handleCardPress,
  };
};