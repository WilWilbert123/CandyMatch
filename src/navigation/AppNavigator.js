import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import GameScreen from '../screens/GameScreen';
import HighScoresScreen from '../screens/HighScoresScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';

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
        name="LevelSelect" 
        component={LevelSelectScreen} 
        options={{ title: 'Level Map', headerShown: false }}
      />
      <Stack.Screen 
        name="Game" 
        component={GameScreen} 
        options={{ title: 'Let\'s Play!', headerShown: false }}
      />
      <Stack.Screen 
        name="HighScores" 
        component={HighScoresScreen} 
        options={{ title: 'High Scores', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;