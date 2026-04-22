import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import React from 'react';
import AppNavigator from '../src/navigation/AppNavigator';

export default function Index() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}