// hooks/useGameLogic.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const useGameLogic = (initialTime = 30, targetScore = 100, gameMode = 'tap') => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameActive, setGameActive] = useState(true);
  const [items, setItems] = useState([]);
  const [combo, setCombo] = useState(0);
  const [missedItems, setMissedItems] = useState(0);
  const [tapEffect, setTapEffect] = useState(null);
  
  // Only for basket mode
  const [catcherX, setCatcherX] = useState(width / 2 - 100 / 2);
  
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const comboTimeoutRef = useRef(null);
  const maxMisses = 8;
  
  const CATCHER_WIDTH = 100;
  const CATCHER_HEIGHT = 85;
  const CATCHER_Y_OFFSET = 20;

  // Generate falling item
  const generateItem = useCallback(() => {
    const isCandy = Math.random() > 0.2; // 80% candy, 20% bomb
    return {
      id: Math.random().toString() + Date.now(),
      x: Math.random() * (width - 60) + 30,
      y: 0,
      type: isCandy ? 'candy' : 'bomb',
      value: isCandy ? Math.floor(Math.random() * 20) + 10 : -15,
      emoji: isCandy ? ['🍬', '🍭', '🍫', '🍪'][Math.floor(Math.random() * 4)] : '💣',
      size: isCandy ? 50 : 45,
      isActive: true,
    };
  }, []);

  // Start spawning items
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      setItems(prev => [...prev, generateItem()]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameActive, generateItem]);

  // Handle tap on item (for tap mode)
  const handleTapItem = useCallback((itemId, tapX, tapY) => {
    if (!gameActive) return false;
    
    const item = items.find(i => i.id === itemId);
    if (!item || !item.isActive) return false;
    
    // Remove item immediately
    setItems(prev => prev.filter(i => i.id !== itemId));
    
    // Show tap effect
    if (tapX && tapY) {
      setTapEffect({ x: tapX, y: tapY });
      setTimeout(() => setTapEffect(null), 300);
    }
    
    // Update combo
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    setCombo(prev => prev + 1);
    
    // Calculate score with combo bonus
    const currentCombo = combo + 1;
    const bonus = Math.floor(item.value * (currentCombo * 0.1));
    const totalGain = item.value + bonus;
    
    setScore(prev => prev + totalGain);
    
    // Set timeout to decay combo
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(prev => Math.max(0, prev - 1));
    }, 1500);
    
    return true;
  }, [gameActive, items, combo]);

  // Collision detection and animation loop (for basket mode)
  useEffect(() => {
    if (!gameActive || gameMode === 'tap') return;

    const animate = (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const delta = timestamp - lastTimestampRef.current;
      if (delta > 16) {
        setItems(prev => {
          const catcherRect = {
            left: catcherX,
            right: catcherX + CATCHER_WIDTH,
            top: height - CATCHER_HEIGHT - CATCHER_Y_OFFSET,
            bottom: height - CATCHER_Y_OFFSET,
          };

          const remainingItems = [];
          let newMissedCount = 0;
          let caughtAny = false;

          for (const item of prev) {
            if (!item.isActive) continue;
            
            const newY = item.y + 5;
            
            const itemRect = {
              left: item.x,
              right: item.x + item.size,
              top: newY,
              bottom: newY + item.size,
            };

            const isColliding = !(itemRect.right < catcherRect.left ||
                                 itemRect.left > catcherRect.right ||
                                 itemRect.bottom < catcherRect.top ||
                                 itemRect.top > catcherRect.bottom);

            if (isColliding && newY + item.size >= catcherRect.top) {
              caughtAny = true;
              
              setCombo(prev => prev + 1);
              
              const currentCombo = combo + 1;
              const comboBonus = currentCombo > 1 ? Math.floor(item.value * (currentCombo * 0.1)) : 0;
              const finalValue = item.value + comboBonus;
              
              setScore(prevScore => Math.max(0, prevScore + finalValue));
            } 
            else if (newY + item.size >= height) {
              if (item.type === 'candy') {
                newMissedCount++;
                setCombo(0);
                if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
              }
            } 
            else {
              remainingItems.push({ ...item, y: newY, isActive: true });
            }
          }

          if (!caughtAny && combo > 0) {
            setCombo(prevCombo => Math.max(0, prevCombo - 0.2));
          }

          if (newMissedCount > 0) {
            setMissedItems(prev => {
              const newTotal = prev + newMissedCount;
              if (newTotal >= maxMisses) setGameActive(false);
              return newTotal;
            });
          }

          return remainingItems;
        });
        
        lastTimestampRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameActive, catcherX, combo, gameMode]);

  // Movement for items in both modes
  useEffect(() => {
    if (!gameActive) return;

    const moveInterval = setInterval(() => {
      setItems(prev => {
        const remainingItems = [];
        let newMissedCount = 0;
        
        for (const item of prev) {
          if (!item.isActive) continue;
          
          const newY = item.y + 5;
          
          if (newY + item.size >= height) {
            if (item.type === 'candy') {
              newMissedCount++;
              setCombo(0);
              if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
            }
          } else {
            remainingItems.push({ ...item, y: newY, isActive: true });
          }
        }
        
        if (newMissedCount > 0) {
          setMissedItems(prevMissed => {
            const newTotal = prevMissed + newMissedCount;
            if (newTotal >= maxMisses) setGameActive(false);
            return newTotal;
          });
        }
        
        return remainingItems;
      });
    }, 1000 / 60);
    
    return () => clearInterval(moveInterval);
  }, [gameActive]);

  // Timer logic
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

  // Move catcher (for basket mode)
  const moveCatcher = useCallback((newX) => {
    if (gameMode !== 'basket') return;
    let boundedX = newX - CATCHER_WIDTH / 2;
    boundedX = Math.max(0, Math.min(width - CATCHER_WIDTH, boundedX));
    setCatcherX(boundedX);
  }, [gameMode]);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(initialTime);
    setGameActive(true);
    setItems([]);
    setCombo(0);
    setMissedItems(0);
    setCatcherX(width / 2 - CATCHER_WIDTH / 2);
    setTapEffect(null);
    lastTimestampRef.current = 0;
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
  }, [initialTime]);

  // Check win condition
  const isWin = score >= targetScore && gameActive;
  
  useEffect(() => {
    if (isWin) setGameActive(false);
  }, [isWin, score, targetScore]);

  return {
    score,
    timeLeft,
    gameActive,
    items,
    combo,
    missedItems,
    maxMisses,
    tapEffect,
    // For basket mode
    catcherX,
    catcherWidth: CATCHER_WIDTH,
    catcherHeight: CATCHER_HEIGHT,
    moveCatcher,
    // For tap mode
    handleTapItem,
    // Common
    resetGame,
    isWin,
  };
};