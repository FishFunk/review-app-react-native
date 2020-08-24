import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { View, Text } from 'react-native';

import FirebaseService from './services/firebaseService';
import LoginScreen from './screens/LoginScreen';

FirebaseService.init((success: boolean)=>{
  console.log(`Firebase initialized: ${success}`);
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user: any){
    setUser(user);
    if(initializing) setInitializing(false);
  }

  useEffect(()=>{
    const subscriber = FirebaseService.auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (!isLoadingComplete || initializing) {
    return null;
  }
  
  if(!user){
    return (<LoginScreen/>)
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
