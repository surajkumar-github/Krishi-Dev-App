// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from './screens/homescreen';
import ChatWithBot from './screens/chatwithbot';
import AgriculturalNewsScreen from './screens/AgriculturalNewsScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChatWithBot" component={ChatWithBot} />
        <Stack.Screen name="News" component={AgriculturalNewsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
