// src/games/CandyMatch/levels.js

// Ensure LEVELS array is properly defined
export const LEVELS = [];

for (let i = 1; i <= 100; i++) {
  let pairsCount, gridCols, gridRows, timeLimit, requiredScore;
  
  if (i <= 10) {
    pairsCount = 4;
    gridCols = 4;
    gridRows = 2;
    timeLimit = null;
    requiredScore = 40;
  } else if (i <= 30) {
    pairsCount = 6;
    gridCols = 4;
    gridRows = 3;
    timeLimit = null;
    requiredScore = 60;
  } else if (i <= 60) {
    pairsCount = 8;
    gridCols = 4;
    gridRows = 4;
    timeLimit = null;
    requiredScore = 80;
  } else if (i <= 80) {
    pairsCount = 10;
    gridCols = 5;
    gridRows = 4;
    timeLimit = 180;
    requiredScore = 100;
  } else {
    pairsCount = 12;
    gridCols = 6;
    gridRows = 4;
    timeLimit = 240;
    requiredScore = 120;
  }
  
  LEVELS.push({
    id: i,
    levelNumber: i,
    pairsCount,
    gridCols,
    gridRows,
    timeLimit,
    requiredScore,
    starThresholds: {
      threeStars: requiredScore,
      twoStars: Math.floor(requiredScore * 0.7),
      oneStar: Math.floor(requiredScore * 0.5)
    }
  });
}

// Add safety check for empty LEVELS
if (LEVELS.length === 0) {
  console.error('LEVELS array is empty!');
}

export const getThemeForLevel = (levelNumber) => {
  const themes = [
    { name: '🐾 Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'], colors: ['#FF6B6B', '#4ECDC4'] },
    { name: '🍎 Fruits', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭'], colors: ['#FF69B4', '#9B59B6'] },
    { name: '🚗 Vehicles', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛'], colors: ['#F1C40F', '#E67E22'] },
    { name: '⚽ Sports', emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '⛳'], colors: ['#3498DB', '#2ECC71'] },
    { name: '🎵 Music', emojis: ['🎵', '🎶', '🎹', '🎸', '🎺', '🎷', '🥁', '🎤', '🎧', '🎼', '🎻', '🪕'], colors: ['#9B59B6', '#E74C3C'] },
  ];
  
  // Add safety check
  if (!levelNumber || levelNumber < 1) {
    return themes[0];
  }
  
  const themeIndex = Math.floor((levelNumber - 1) / 17) % themes.length;
  return themes[themeIndex];
};