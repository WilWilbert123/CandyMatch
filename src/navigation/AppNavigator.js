// src/navigation/AppNavigator.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import all screens
import GameResultScreen from '../games/CandyCatch/GameResultScreen';
import CandyCatchScreen from '../games/CandyCatch/GameScreen'; // Import Candy Catch
import CandyCatchLevelSelect from '../games/CandyCatch/LevelSelectScreen';
import GameScreen from '../games/CandyMatch/GameScreen';
import LevelSelectScreen from '../games/CandyMatch/LevelSelectScreen';
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
console.log('LevelSelectScreen:', typeof LevelSelectScreen);
console.log('GameScreen:', typeof GameScreen);
console.log('CandyCatchScreen:', typeof CandyCatchScreen);
console.log('GameHubScreen:', typeof GameHubScreen);
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
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

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
        name="LevelSelect"
        component={LevelSelectScreen}
        options={{ headerShown: false, title: 'Level Map' }}
      />

      {/* Game Screens */}
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ headerShown: false, title: "Candy Match" }}
      />

      <Stack.Screen
        name="CandyCatch"
        component={CandyCatchScreen}
        options={{ headerShown: false, title: "Candy Catch" }}
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
      <Stack.Screen
        name="GameResult"
        component={GameResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CandyCatchLevelSelect"
        component={CandyCatchLevelSelect}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
};

export default AppNavigator;