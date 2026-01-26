// App.tsx – updated for src folder structure

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LandingScreen from './src/Screens/LandingScreen';
import MainTabs from './src/Screens/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding')
      .then(value => {
        setHasSeenOnboarding(value === 'true');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return null; // or a simple splash screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasSeenOnboarding && (
            <Stack.Screen 
              name="Landing" 
              component={LandingScreen} 
            />
          )}
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ gestureEnabled: false }} // optional: disable swipe-back to landing
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}