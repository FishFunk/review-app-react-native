import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Container } from 'native-base';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import FirebaseService from './services/firebaseService';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import Screen2 from './screens/Screen2/Screen2';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';

export default function App(props: any) {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const drawerNavigator = createDrawerNavigator();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [fontLoaded, setFontLoaded] = useState(false);

  function onAuthStateChanged(user: any){
    setUser(user);
    if(initializing) setInitializing(false);
  }

  useEffect(()=>{
    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
    })
    .then(()=>setFontLoaded(true));
  })

  useEffect(()=>{
    const subscriber = FirebaseService.auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (!isLoadingComplete || initializing || !fontLoaded) {
    return <AppLoading/>;
  }
  
  if(!user){
    return (<LoginScreen/>)
  } else {
    return (
      <Container>
        <StatusBar />
        <NavigationContainer>
          <drawerNavigator.Navigator initialRouteName="Home">
            <drawerNavigator.Screen name="Home" component={HomeScreen} />
            <drawerNavigator.Screen name="Account" component={Screen2} />
          </drawerNavigator.Navigator>
        </NavigationContainer>  
      </Container>
    );
  }
}
