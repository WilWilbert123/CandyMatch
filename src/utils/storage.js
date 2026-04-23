import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys - Now dynamic with gameId
const getStorageKeys = (gameId = 'candy_match') => ({
  LEVEL_PROGRESS: `@candy_${gameId}_level_progress`,
  GAME_SESSIONS: `@candy_${gameId}_game_sessions`,
  UNLOCKED_LEVELS: `@candy_${gameId}_unlocked_levels`,
  SETTINGS: '@candy_settings',
});

// Level Progress Management (Game-specific)
export async function saveLevelProgress(gameId, levelNumber, starsEarned, score, moves, timeSpent) {
  try {
    const keys = getStorageKeys(gameId);
    const progress = await getLevelProgress(gameId);
    const existingLevel = progress.find(l => l.levelNumber === levelNumber);
    
    if (existingLevel) {
      if (score > existingLevel.bestScore) {
        existingLevel.bestScore = score;
        existingLevel.bestStars = Math.max(existingLevel.bestStars, starsEarned);
        existingLevel.bestMoves = Math.min(existingLevel.bestMoves, moves);
        existingLevel.completedAt = Date.now();
      }
    } else {
      progress.push({
        levelNumber: levelNumber,
        bestStars: starsEarned,
        bestScore: score,
        bestMoves: moves,
        isLocked: false,
        completedAt: Date.now(),
      });
    }
    
    await AsyncStorage.setItem(keys.LEVEL_PROGRESS, JSON.stringify(progress));
    
    // Unlock next level if applicable
    const nextLevel = levelNumber + 1;
    if (nextLevel <= 100) {
      await unlockLevel(gameId, nextLevel);
    }
    
    // Update total stars for the user
    await updateTotalStars(gameId);
    
    return true;
  } catch (error) {
    console.error('Error saving level progress:', error);
    return false;
  }
}

export async function getLevelProgress(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    const data = await AsyncStorage.getItem(keys.LEVEL_PROGRESS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting level progress:', error);
    return [];
  }
}

export async function unlockLevel(gameId, levelNumber) {
  try {
    const keys = getStorageKeys(gameId);
    const unlockedLevels = await getUnlockedLevels(gameId);
    if (!unlockedLevels.includes(levelNumber)) {
      unlockedLevels.push(levelNumber);
      await AsyncStorage.setItem(keys.UNLOCKED_LEVELS, JSON.stringify(unlockedLevels));
    }
    return true;
  } catch (error) {
    console.error('Error unlocking level:', error);
    return false;
  }
}

export async function getUnlockedLevels(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    const data = await AsyncStorage.getItem(keys.UNLOCKED_LEVELS);
    if (data) {
      return JSON.parse(data);
    }
    // First time - unlock level 1
    const initialUnlocked = [1];
    await AsyncStorage.setItem(keys.UNLOCKED_LEVELS, JSON.stringify(initialUnlocked));
    return initialUnlocked;
  } catch (error) {
    console.error('Error getting unlocked levels:', error);
    return [1];
  }
}

export async function getLevelStars(gameId, levelNumber) {
  try {
    const progress = await getLevelProgress(gameId);
    const level = progress.find(l => l.levelNumber === levelNumber);
    return level ? level.bestStars : 0;
  } catch (error) {
    console.error('Error getting level stars:', error);
    return 0;
  }
}

export async function resetLevelProgress(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    await AsyncStorage.removeItem(keys.LEVEL_PROGRESS);
    await AsyncStorage.setItem(keys.UNLOCKED_LEVELS, JSON.stringify([1]));
    return true;
  } catch (error) {
    console.error('Error resetting level progress:', error);
    return false;
  }
}

// Game Sessions Management (Now handles ALL games)
export async function saveGameSession(gameId, score, matchesFound, timePlayed, childName, levelNumber, starsEarned) {
  try {
    const keys = getStorageKeys(gameId);
    const sessions = await getAllGameSessions(gameId);
    const newSession = {
      id: Date.now(),
      gameId: gameId,
      score: score,
      matchesFound: matchesFound,
      timePlayed: timePlayed,
      childName: childName || 'Player',
      playedAt: Date.now(),
      levelNumber: levelNumber,
      starsEarned: starsEarned,
    };
    
    sessions.unshift(newSession);
    // Keep only last 50 sessions per game
    const trimmedSessions = sessions.slice(0, 50);
    await AsyncStorage.setItem(keys.GAME_SESSIONS, JSON.stringify(trimmedSessions));
    
    // Update global high score
    await updateGlobalHighScore(score);
    
    return true;
  } catch (error) {
    console.error('Error saving game session:', error);
    return false;
  }
}

export async function getAllGameSessions(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    const data = await AsyncStorage.getItem(keys.GAME_SESSIONS);
    const sessions = data ? JSON.parse(data) : [];
    return sessions.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export async function getAllGamesSessions() {
  try {
    const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
    let allSessions = [];
    
    for (const gameId of allGames) {
      const sessions = await getAllGameSessions(gameId);
      allSessions = [...allSessions, ...sessions];
    }
    
    return allSessions.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching all games sessions:', error);
    return [];
  }
}

export async function getTopScores(gameId, limit = 10) {
  try {
    const sessions = await getAllGameSessions(gameId);
    return sessions.slice(0, limit);
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
}

export async function getGlobalTopScores(limit = 20) {
  try {
    const allSessions = await getAllGamesSessions();
    return allSessions.slice(0, limit);
  } catch (error) {
    console.error('Error getting global top scores:', error);
    return [];
  }
}

export async function clearAllGameSessions(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    await AsyncStorage.removeItem(keys.GAME_SESSIONS);
    return true;
  } catch (error) {
    console.error('Error clearing game sessions:', error);
    return false;
  }
}

// Settings Management (Global)
export async function saveSettings(settings) {
  try {
    const keys = getStorageKeys();
    await AsyncStorage.setItem(keys.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function getSettings() {
  try {
    const keys = getStorageKeys();
    const data = await AsyncStorage.getItem(keys.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    const defaultSettings = {
      soundEnabled: true,
      hapticsEnabled: true,
      musicEnabled: true,
    };
    await AsyncStorage.setItem(keys.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return { soundEnabled: true, hapticsEnabled: true, musicEnabled: true };
  }
}

// Utility Functions (Game-specific)
export async function getTotalStarsEarned(gameId) {
  try {
    const progress = await getLevelProgress(gameId);
    return progress.reduce((total, level) => total + level.bestStars, 0);
  } catch (error) {
    console.error('Error calculating total stars:', error);
    return 0;
  }
}

export async function getCompletedLevelsCount(gameId) {
  try {
    const progress = await getLevelProgress(gameId);
    return progress.length;
  } catch (error) {
    console.error('Error counting completed levels:', error);
    return 0;
  }
}

export async function getAverageScore(gameId) {
  try {
    const sessions = await getAllGameSessions(gameId);
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, session) => sum + session.score, 0);
    return Math.round(total / sessions.length);
  } catch (error) {
    console.error('Error calculating average score:', error);
    return 0;
  }
}

// Global User Stats
export async function updateTotalStars(gameId) {
  try {
    const totalStars = await getTotalStarsEarned(gameId);
    const currentTotal = await AsyncStorage.getItem('total_stars');
    const newTotal = (parseInt(currentTotal) || 0) + totalStars;
    await AsyncStorage.setItem('total_stars', newTotal.toString());
    return newTotal;
  } catch (error) {
    console.error('Error updating total stars:', error);
    return 0;
  }
}

export async function getGlobalTotalStars() {
  try {
    const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
    let totalStars = 0;
    
    for (const gameId of allGames) {
      const stars = await getTotalStarsEarned(gameId);
      totalStars += stars;
    }
    
    return totalStars;
  } catch (error) {
    console.error('Error getting global total stars:', error);
    return 0;
  }
}

export async function updateGlobalHighScore(score) {
  try {
    const currentHighScore = await AsyncStorage.getItem('high_score');
    const current = parseInt(currentHighScore) || 0;
    if (score > current) {
      await AsyncStorage.setItem('high_score', score.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating global high score:', error);
    return false;
  }
}

export async function getGlobalHighScore() {
  try {
    const highScore = await AsyncStorage.getItem('high_score');
    return highScore ? parseInt(highScore) : 0;
  } catch (error) {
    console.error('Error getting global high score:', error);
    return 0;
  }
}

export async function getTotalGamesPlayed() {
  try {
    const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
    let totalGames = 0;
    
    for (const gameId of allGames) {
      const sessions = await getAllGameSessions(gameId);
      totalGames += sessions.length;
    }
    
    return totalGames;
  } catch (error) {
    console.error('Error getting total games played:', error);
    return 0;
  }
}

// Clear all data for specific game
export async function clearGameData(gameId) {
  try {
    const keys = getStorageKeys(gameId);
    await AsyncStorage.multiRemove([
      keys.LEVEL_PROGRESS,
      keys.GAME_SESSIONS,
      keys.UNLOCKED_LEVELS,
    ]);
    await unlockLevel(gameId, 1);
    return true;
  } catch (error) {
    console.error('Error clearing game data:', error);
    return false;
  }
}

// Clear all data for all games (for testing)
export async function clearAllData() {
  try {
    const allGames = ['candy_match', 'candy_catch', 'candy_sort', 'candy_memory', 'candy_pop', 'candy_count', 'candy_color', 'candy_puzzle', 'candy_rush', 'candy_bingo'];
    
    for (const gameId of allGames) {
      await clearGameData(gameId);
    }
    
    await AsyncStorage.removeItem('total_stars');
    await AsyncStorage.removeItem('high_score');
    await AsyncStorage.removeItem('purchased_items');
    await AsyncStorage.removeItem('achievements');
    
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}