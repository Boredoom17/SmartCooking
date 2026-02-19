import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LandingScreen from './src/Screens/LandingScreen';
import MainTabs from './src/Screens/MainTabs';
import RecipesScreen from './src/Screens/RecipesScreen';

export type RootStackParamList = {
  Landing: undefined;
  Main: undefined;
  Recipes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="Recipes"
            component={RecipesScreen}
            options={{ headerShown: true, headerTitle: 'Recipe Results' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
