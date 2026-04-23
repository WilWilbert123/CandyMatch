import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOTAL_STARS: 'total_stars',
  COLLECTED_CANDIES: 'collected_candies',
  UNLOCKED_ACHIEVEMENTS: 'unlocked_achievements',
  GAME_PROGRESS_PREFIX: 'game_progress_',
};

export const getTotalStars = async () => {
  const stars = await AsyncStorage.getItem(KEYS.TOTAL_STARS);
  return stars ? parseInt(stars) : 0;
};

export const addStars = async (amount, gameId = null) => {
  const current = await getTotalStars();
  const newTotal = current + amount;
  await AsyncStorage.setItem(KEYS.TOTAL_STARS, newTotal.toString());
  
  if (gameId) {
    const gameStats = await getGameStats(gameId);
    gameStats.totalStarsEarned = (gameStats.totalStarsEarned || 0) + amount;
    await saveGameStats(gameId, gameStats);
  }
  
  return newTotal;
};

export const getGameProgress = async (gameId) => {
  const key = `${KEYS.GAME_PROGRESS_PREFIX}${gameId}`;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : { completedLevels: [], bestScores: {}, bestStars: {}, totalStarsEarned: 0 };
};

export const saveGameProgress = async (gameId, levelNumber, stars, score) => {
  const progress = await getGameProgress(gameId);
  
  if (!progress.completedLevels.includes(levelNumber)) {
    progress.completedLevels.push(levelNumber);
  }
  
  if (!progress.bestScores[levelNumber] || progress.bestScores[levelNumber] < score) {
    progress.bestScores[levelNumber] = score;
  }
  
  if (!progress.bestStars[levelNumber] || progress.bestStars[levelNumber] < stars) {
    progress.bestStars[levelNumber] = stars;
  }
  
  const key = `${KEYS.GAME_PROGRESS_PREFIX}${gameId}`;
  await AsyncStorage.setItem(key, JSON.stringify(progress));
  await addStars(stars * 10, gameId);
  
  return progress;
};

export const saveGameStats = async (gameId, stats) => {
  const key = `${KEYS.GAME_PROGRESS_PREFIX}${gameId}`;
  const progress = await getGameProgress(gameId);
  progress.totalStarsEarned = stats.totalStarsEarned;
  await AsyncStorage.setItem(key, JSON.stringify(progress));
};

export const getGameStats = async (gameId) => {
  const progress = await getGameProgress(gameId);
  return {
    totalLevelsCompleted: progress.completedLevels.length,
    totalStarsEarned: progress.totalStarsEarned || 0,
    bestScore: Math.max(...Object.values(progress.bestScores || {}), 0),
    totalStars: Object.values(progress.bestStars || {}).reduce((a, b) => a + b, 0),
  };
};

export const getOverallProgress = async () => {
  const games = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
  const overall = {};
  
  for (const gameId of games) {
    overall[gameId] = await getGameStats(gameId);
  }
  
  overall.totalStars = await getTotalStars();
  overall.gamesPlayed = games.filter(g => overall[g].totalLevelsCompleted > 0).length;
  
  return overall;
};