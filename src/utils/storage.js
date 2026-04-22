import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  LEVEL_PROGRESS: '@candy_match_level_progress',
  GAME_SESSIONS: '@candy_match_game_sessions',
  UNLOCKED_LEVELS: '@candy_match_unlocked_levels',
  SETTINGS: '@candy_match_settings',
};

// Level Progress Management
export async function saveLevelProgress(levelNumber, starsEarned, score, moves, timeSpent) {
  try {
    const progress = await getLevelProgress();
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
    
    await AsyncStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(progress));
    
    // Unlock next level if applicable
    const nextLevel = levelNumber + 1;
    if (nextLevel <= 100) {
      await unlockLevel(nextLevel);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving level progress:', error);
    return false;
  }
}

export async function getLevelProgress() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting level progress:', error);
    return [];
  }
}

export async function unlockLevel(levelNumber) {
  try {
    const unlockedLevels = await getUnlockedLevels();
    if (!unlockedLevels.includes(levelNumber)) {
      unlockedLevels.push(levelNumber);
      await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify(unlockedLevels));
    }
    return true;
  } catch (error) {
    console.error('Error unlocking level:', error);
    return false;
  }
}

export async function getUnlockedLevels() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
    if (data) {
      return JSON.parse(data);
    }
    // First time - unlock level 1
    const initialUnlocked = [1];
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify(initialUnlocked));
    return initialUnlocked;
  } catch (error) {
    console.error('Error getting unlocked levels:', error);
    return [1];
  }
}

export async function getLevelStars(levelNumber) {
  try {
    const progress = await getLevelProgress();
    const level = progress.find(l => l.levelNumber === levelNumber);
    return level ? level.bestStars : 0;
  } catch (error) {
    console.error('Error getting level stars:', error);
    return 0;
  }
}

export async function resetLevelProgress() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LEVEL_PROGRESS);
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify([1]));
    return true;
  } catch (error) {
    console.error('Error resetting level progress:', error);
    return false;
  }
}

// Game Sessions Management
export async function saveGameSession(score, matchesFound, timePlayed, childName, levelNumber, starsEarned) {
  try {
    const sessions = await getAllGameSessions();
    const newSession = {
      id: Date.now(),
      score: score,
      matchesFound: matchesFound,
      timePlayed: timePlayed,
      childName: childName || 'Player',
      playedAt: Date.now(),
      levelNumber: levelNumber,
      starsEarned: starsEarned,
    };
    
    sessions.unshift(newSession);
    // Keep only last 50 sessions
    const trimmedSessions = sessions.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(trimmedSessions));
    return true;
  } catch (error) {
    console.error('Error saving game session:', error);
    return false;
  }
}

export async function getAllGameSessions() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
    const sessions = data ? JSON.parse(data) : [];
    return sessions.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export async function getTopScores(limit = 10) {
  try {
    const sessions = await getAllGameSessions();
    return sessions.slice(0, limit);
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
}

export async function clearAllGameSessions() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_SESSIONS);
    return true;
  } catch (error) {
    console.error('Error clearing game sessions:', error);
    return false;
  }
}

// Settings Management
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    const defaultSettings = {
      soundEnabled: true,
      hapticsEnabled: true,
      musicEnabled: true,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return { soundEnabled: true, hapticsEnabled: true, musicEnabled: true };
  }
}

// Utility Functions
export async function getTotalStarsEarned() {
  try {
    const progress = await getLevelProgress();
    return progress.reduce((total, level) => total + level.bestStars, 0);
  } catch (error) {
    console.error('Error calculating total stars:', error);
    return 0;
  }
}

export async function getCompletedLevelsCount() {
  try {
    const progress = await getLevelProgress();
    return progress.length;
  } catch (error) {
    console.error('Error counting completed levels:', error);
    return 0;
  }
}

export async function getAverageScore() {
  try {
    const sessions = await getAllGameSessions();
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, session) => sum + session.score, 0);
    return Math.round(total / sessions.length);
  } catch (error) {
    console.error('Error calculating average score:', error);
    return 0;
  }
}

// Clear all data (for testing)
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LEVEL_PROGRESS,
      STORAGE_KEYS.GAME_SESSIONS,
      STORAGE_KEYS.UNLOCKED_LEVELS,
    ]);
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify([1]));
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}