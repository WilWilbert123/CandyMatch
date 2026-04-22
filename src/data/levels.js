export const LEVELS = [];

for (let i = 1; i <= 100; i++) {
  let pairsCount;
  let gridCols;
  let gridRows;
  let timeLimit;
  let requiredScore;
  
  if (i <= 10) {
    pairsCount = 4;
    gridCols = 4;
    gridRows = 2;
    timeLimit = null;
    requiredScore = 40;
  } 
  else if (i <= 30) {
    pairsCount = 6;
    gridCols = 4;
    gridRows = 3;
    timeLimit = null;
    requiredScore = 60;
  }
  else if (i <= 60) {
    pairsCount = 8;
    gridCols = 4;
    gridRows = 4;
    timeLimit = null;
    requiredScore = 80;
  }
  else if (i <= 80) {
    pairsCount = 10;
    gridCols = 5;
    gridRows = 4;
    timeLimit = 180;
    requiredScore = 100;
  }
  else {
    pairsCount = 12;
    gridCols = 6;
    gridRows = 4;
    timeLimit = 240;
    requiredScore = 120;
  }
  
  LEVELS.push({
    id: i,
    levelNumber: i,
    pairsCount: pairsCount,
    gridCols: gridCols,
    gridRows: gridRows,
    timeLimit: timeLimit,
    requiredScore: requiredScore,
    starThresholds: {
      threeStars: requiredScore,
      twoStars: requiredScore * 0.7,
      oneStar: requiredScore * 0.5
    }
  });
}

export const getThemeForLevel = (levelNumber) => {
  const themes = [
    { name: '🐾 Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'] },
    { name: '🍎 Fruits', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭'] },
    { name: '🚗 Vehicles', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛'] },
    { name: '⚽ Sports', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸'] },
    { name: '🎵 Music', emojis: ['🎵', '🎶', '🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🪕', '🎤', '🎧', '📯'] },
  ];
  
  const themeIndex = Math.floor((levelNumber - 1) / 20) % themes.length;
  return themes[themeIndex];
};