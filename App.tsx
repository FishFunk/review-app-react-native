import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Container } from 'native-base';
import useCachedResources from './hooks/useCachedResources';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import FirebaseService from './services/firebaseService';
import HomeScreen from './screens/HomeScreen';
import Screen2 from './screens/ProfileScreen';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginSocialScreen';
import RegisterScreen from './screens/RegisterScreen';
import { createStackNavigator } from '@react-navigation/stack';
import SocialScreen from './screens/SocialScreen';
import { checkForUpdates } from './services/updateService';
// import LoginEmailScreen from './screens/LoginEmailScreen';

export default function App(props: any) {
  const isLoadingComplete = useCachedResources();
  const stackNavigator = createStackNavigator();
  const mainStackNavigator = createStackNavigator();


  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [updating, setUpdating] = useState(true);

  function onAuthStateChanged(user: any){
    setUser(user);
    if(initializing) setInitializing(false);
  }

  useEffect(()=>{
    checkForUpdates()
      .then(()=>setUpdating(false))
      .catch(error=>console.error(error));
  }, [])

  useEffect(()=>{
    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
    })
    .then(()=>setFontLoaded(true));
  }, [])

  useEffect(()=>{
    const subscriber = FirebaseService.auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (!isLoadingComplete || initializing || !fontLoaded || updating) {
    return <AppLoading/>;
  }
  
  if(!user){
    return (
        <NavigationContainer>
          <stackNavigator.Navigator initialRouteName="LoginFacebook">
            <stackNavigator.Screen name="LoginFacebook" component={LoginScreen} 
              options={{
                headerShown: false
              }}/>
            {/* <stackNavigator.Screen name="LoginEmail" component={LoginEmailScreen} 
              options={{
                headerShown: false
              }}/> */}
            <stackNavigator.Screen name="Register" component={RegisterScreen} 
              options={{
                headerShown: false
              }}/>
          </stackNavigator.Navigator>
        </NavigationContainer>
    )
  } else {
    return (
      <Container>
        <StatusBar />
        <NavigationContainer>
          <mainStackNavigator.Navigator initialRouteName="Home" screenOptions={{
            headerShown: false,
          }}>
            <mainStackNavigator.Screen name="Home" component={HomeScreen} />
            <mainStackNavigator.Screen options={{gestureDirection: 'horizontal-inverted'}} name="Account" component={Screen2} />
            <mainStackNavigator.Screen name="Social" component={SocialScreen} />
          </mainStackNavigator.Navigator>
        </NavigationContainer>  
      </Container>
    );
  }
}
