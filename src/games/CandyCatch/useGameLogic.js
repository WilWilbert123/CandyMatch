// hooks/useGameLogic.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Catcher configuration
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 85;
const CATCHER_Y_OFFSET = 20; // Distance from bottom

export const useGameLogic = (initialTime = 30, targetScore = 100) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameActive, setGameActive] = useState(true);
  const [items, setItems] = useState([]);
  const [combo, setCombo] = useState(0);
  const [lastCaught, setLastCaught] = useState(null);
  const [catcherX, setCatcherX] = useState(width / 2 - CATCHER_WIDTH / 2);
  const [missedItems, setMissedItems] = useState(0);
  
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const maxMisses = 8; // Game over after 8 misses

  // Generate falling item
  const generateItem = useCallback(() => {
    const isCandy = Math.random() > 0.2; // 80% candy, 20% bomb
    return {
      id: Math.random().toString(),
      x: Math.random() * (width - 60) + 30,
      y: 0,
      type: isCandy ? 'candy' : 'bomb',
      value: isCandy ? Math.floor(Math.random() * 20) + 10 : -15,
      emoji: isCandy ? ['🍬', '🍭', '🍫', '🍪'][Math.floor(Math.random() * 4)] : '💣',
      size: isCandy ? 50 : 45,
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

  // Collision detection and animation loop
  useEffect(() => {
    if (!gameActive) return;

    const animate = (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const delta = timestamp - lastTimestampRef.current;
      if (delta > 16) { // ~60fps
        setItems(prev => {
          const catcherRect = {
            left: catcherX,
            right: catcherX + CATCHER_WIDTH,
            top: height - CATCHER_HEIGHT - CATCHER_Y_OFFSET,
            bottom: height - CATCHER_Y_OFFSET,
          };

          const remainingItems = [];
          let newMissedCount = 0;
          let caughtItems = [];

          for (const item of prev) {
            // Update item position
            const newY = item.y + 5;
            
            // Check collision with catcher
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
              // Item caught!
              caughtItems.push(item);
            } 
            else if (newY + item.size >= height) {
              // Item missed (fell off screen)
              if (item.type === 'candy') {
                newMissedCount++;
              }
              // Bomb doesn't count as miss
            } 
            else {
              // Item still falling
              remainingItems.push({ ...item, y: newY });
            }
          }

          // Process caught items
          if (caughtItems.length > 0) {
            caughtItems.forEach(item => {
              // Update combo based on item type
              if (lastCaught === item.type) {
                setCombo(prevCombo => Math.min(prevCombo + 1, 10));
              } else {
                setCombo(1);
              }
              setLastCaught(item.type);

              // Calculate score with combo bonus
              const comboBonus = combo > 1 ? Math.floor(item.value * (combo * 0.1)) : 0;
              const finalValue = item.value + comboBonus;
              
              setScore(prevScore => Math.max(0, prevScore + finalValue));
            });
          }

          // Update missed items count
          if (newMissedCount > 0) {
            setMissedItems(prev => {
              const newTotal = prev + newMissedCount;
              if (newTotal >= maxMisses) {
                setGameActive(false);
              }
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, catcherX, combo, lastCaught]);

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

  // Move catcher (for touch/mouse events)
  const moveCatcher = useCallback((newX) => {
    let boundedX = newX - CATCHER_WIDTH / 2;
    boundedX = Math.max(0, Math.min(width - CATCHER_WIDTH, boundedX));
    setCatcherX(boundedX);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(initialTime);
    setGameActive(true);
    setItems([]);
    setCombo(0);
    setLastCaught(null);
    setMissedItems(0);
    setCatcherX(width / 2 - CATCHER_WIDTH / 2);
    lastTimestampRef.current = 0;
  }, [initialTime]);

  // Check win condition
  const isWin = score >= targetScore && gameActive;
  
  useEffect(() => {
    if (isWin) {
      setGameActive(false);
    }
  }, [isWin]);

  return {
    score,
    timeLeft,
    gameActive,
    items,
    combo,
    missedItems,
    maxMisses,
    catcherX,
    catcherWidth: CATCHER_WIDTH,
    catcherHeight: CATCHER_HEIGHT,
    moveCatcher,
    resetGame,
    isWin,
  };
};