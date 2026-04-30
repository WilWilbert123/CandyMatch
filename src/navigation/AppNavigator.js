// src/navigation/AppNavigator.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import all screens - Candy Catch
import CandyCatchGameResult from '../games/CandyCatch/GameResultScreen';
import CandyCatchScreen from '../games/CandyCatch/GameScreen';
import CandyCatchLevelSelect from '../games/CandyCatch/LevelSelectScreen';

// Candy Match imports
import CandyMatchGameResult from '../games/CandyMatch/GameResultScreen';
import CandyMatchGameScreen from '../games/CandyMatch/GameScreen';
import CandyMatchLevelSelect from '../games/CandyMatch/LevelSelectScreen';

// Candy Sort imports
import CandySortGameResult from '../games/CandySort/GameResultScreen';
import CandySortGameScreen from '../games/CandySort/GameScreen';
import CandySortLevelSelect from '../games/CandySort/LevelSelectScreen';

//Candy Memory imports
import CandyMemoryGameResult from '../games/CandyMemory/GameResultScreen';
import CandyMemoryGameScreen from '../games/CandyMemory/GameScreen';
import CandyMemoryLevelSelect from '../games/CandyMemory/LevelSelectScreen';

//Candy Pop imports
import CandyPopGameResult from '../games/CandyPop/GameResultScreen';
import CandyPopGameScreen from '../games/CandyPop/GameScreen';
import CandyPopLevelSelect from '../games/CandyPop/LevelSelectScreen';

// Other screens
import AchievementsScreen from '../screens/AchievementsScreen';
import CandyCollectionScreen from '../screens/CandyCollectionScreen';
import CandyShopScreen from '../screens/CandyShopScreen';
import GameHubScreen from '../screens/GameHubScreen';
import GameLauncherScreen from '../screens/GameLauncherScreen';
import GlobalHighScoresScreen from '../screens/GlobalHighScoresScreen';
import HighScoresScreen from '../screens/HighScoresScreen';
import HomeScreen from '../screens/HomeScreen';

// Debug all imports
console.log('=== SCREEN IMPORTS DEBUG ===');
console.log('HomeScreen:', typeof HomeScreen);
console.log('GameHubScreen:', typeof GameHubScreen);
console.log('CandyMatchLevelSelect:', typeof CandyMatchLevelSelect);
console.log('CandyCatchLevelSelect:', typeof CandyCatchLevelSelect);
console.log('CandySortLevelSelect:', typeof CandySortLevelSelect);
console.log('CandySortGameResult:', typeof CandySortGameResult);
console.log('=============================');

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 24,
        },
        headerBackTitle: 'Back',
      }}
    >
      {/* Home Screen */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      {/* Game Hub & Launcher */}
      <Stack.Screen
        name="GameHub"
        component={GameHubScreen}
        options={{ headerShown: false, title: '🍬 Game Hub' }}
      />
      <Stack.Screen
        name="GameLauncher"
        component={GameLauncherScreen}
        options={{ headerShown: false, title: '🎮 Play Game' }}
      />

      {/* Collection & Shop Screens */}
      <Stack.Screen
        name="CandyCollection"
        component={CandyCollectionScreen}
        options={{ headerShown: false, title: '🍬 Candy Collection' }}
      />
      <Stack.Screen
        name="CandyShop"
        component={CandyShopScreen}
        options={{ headerShown: false, title: '🏪 Candy Shop' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerShown: false, title: '🏆 Achievements' }}
      />
      <Stack.Screen
        name="HighScores"
        component={HighScoresScreen}
        options={{ title: 'High Scores', headerShown: false }}
      />
      <Stack.Screen
        name="GlobalHighScores"
        component={GlobalHighScoresScreen}
        options={{ headerShown: false }}
      />

      {/* Candy Match Screens */}
      <Stack.Screen
        name="CandyMatchLevelSelect"
        component={CandyMatchLevelSelect}
        options={{ headerShown: false, title: 'Candy Match Levels' }}
      />
      <Stack.Screen
        name="CandyMatch"
        component={CandyMatchGameScreen}
        options={{ headerShown: false, title: 'Candy Match' }}
      />
      <Stack.Screen
        name="CandyMatchResult"
        component={CandyMatchGameResult}
        options={{ headerShown: false }}
      />

      {/* Candy Catch Screens */}
      <Stack.Screen
        name="CandyCatchLevelSelect"
        component={CandyCatchLevelSelect}
        options={{ headerShown: false, title: 'Candy Catch Levels' }}
      />
      <Stack.Screen
        name="CandyCatch"
        component={CandyCatchScreen}
        options={{ headerShown: false, title: 'Candy Catch' }}
      />
      <Stack.Screen
        name="CandyCatchResult"
        component={CandyCatchGameResult}
        options={{ headerShown: false }}
      />

      {/* Candy Sort Screens */}
      <Stack.Screen
        name="CandySortLevelSelect"
        component={CandySortLevelSelect}
        options={{ headerShown: false, title: 'Candy Sort Levels' }}
      />
      <Stack.Screen
        name="CandySort"
        component={CandySortGameScreen}
        options={{ headerShown: false, title: 'Candy Sort' }}
      />
      <Stack.Screen
        name="CandySortResult"
        component={CandySortGameResult}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CandyMemoryLevelSelect"
        component={CandyMemoryLevelSelect}
        options={{ headerShown: false, title: 'Candy Memory Levels' }}
      />
      <Stack.Screen
        name="CandyMemory"
        component={CandyMemoryGameScreen}
        options={{ headerShown: false, title: 'Candy Memory' }}
      />
      <Stack.Screen
        name="CandyMemoryResult"
        component={CandyMemoryGameResult}
        options={{ headerShown: false }}
      />

      <Stack.Screen
  name="CandyPopLevelSelect"
  component={CandyPopLevelSelect}
  options={{ headerShown: false, title: 'Candy Pop Levels' }}
/>
<Stack.Screen
  name="CandyPop"
  component={CandyPopGameScreen}
  options={{ headerShown: false, title: 'Candy Pop' }}
/>
<Stack.Screen
  name="CandyPopResult"
  component={CandyPopGameResult}
  options={{ headerShown: false }}
/>

    </Stack.Navigator>




  );
};

export default AppNavigator;