import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Container, Root, StyleProvider } from 'native-base';
import useCachedResources from './hooks/useCachedResources';
import * as Font from 'expo-font';
import FirebaseService from './services/firebaseService';
import HomeScreen from './screens/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { Assets, createStackNavigator } from '@react-navigation/stack';
import SocialScreen from './screens/SocialScreen';
import { checkForUpdates } from './services/updateService';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlaceDetailsScreen from './screens/PlaceDetailsScreen';
import IntroScreen from './screens/IntroScreen';
// import LoginScreen from './screens/LoginSocialScreen';
// import RegisterScreen from './screens/RegisterScreen';
// import LoginEmailScreen from './screens/LoginEmailScreen';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import SpinnerContainer from './components/SpinnerContainer';
import Constants from 'expo-constants';
import theme from './styles/theme';
import { useAssets } from 'expo-asset';

export default function App(props: any) {
  const isLoadingComplete = useCachedResources();
  const stackNavigator = createStackNavigator();
  const mainStackNavigator = createStackNavigator();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<firebase.User>();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [updating, setUpdating] = useState(true);

  const [assets] = useAssets([
    require('./assets/images/profile.png'),
    require('./assets/images/yelp_logo/yelp_logo_transparent.png'), 
    require('./assets/images/yelp_stars/small/small_0.png'),
    require('./assets/images/yelp_stars/small/small_1_half.png'),
    require('./assets/images/yelp_stars/small/small_2.png'),
    require('./assets/images/yelp_stars/small/small_2_half.png'),
    require('./assets/images/yelp_stars/small/small_3.png'),
    require('./assets/images/yelp_stars/small/small_3_half.png'),
    require('./assets/images/yelp_stars/small/small_4.png'),
    require('./assets/images/yelp_stars/small/small_4_half.png'),
    require('./assets/images/yelp_stars/small/small_5.png'),
    require('./assets/images/yelp_stars/regular/regular_0.png'),
    require('./assets/images/yelp_stars/regular/regular_1_half.png'),
    require('./assets/images/yelp_stars/regular/regular_2.png'),
    require('./assets/images/yelp_stars/regular/regular_2_half.png'),
    require('./assets/images/yelp_stars/regular/regular_3.png'),
    require('./assets/images/yelp_stars/regular/regular_3_half.png'),
    require('./assets/images/yelp_stars/regular/regular_4.png'),
    require('./assets/images/yelp_stars/regular/regular_4_half.png'),
    require('./assets/images/yelp_stars/regular/regular_5.png')]);

  async function onAuthStateChanged(user: firebase.User){
    if(user) await FirebaseService.initializeUser(user);
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
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      'Nunito-Regular': require('./assets/fonts/Nunito/Nunito-Regular.ttf'),
      'Nunito-Bold': require('./assets/fonts/Nunito/Nunito-Bold.ttf'),
      'Nunito-Light': require('./assets/fonts/Nunito/Nunito-Light.ttf')
    })
    .then(()=>setFontLoaded(true));
  }, [])

  useEffect(()=>{
    const subscriber = FirebaseService.auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (!isLoadingComplete || initializing || !fontLoaded || updating || !assets) {
    return <SpinnerContainer />;
  }

  if(!user){
    return (
      <StyleProvider style={getTheme(platform)}>
        <NavigationContainer>
          <stackNavigator.Navigator initialRouteName="IntroScreen">
            <stackNavigator.Screen name="IntroScreen" component={IntroScreen} 
                options={{
                  headerShown: false
            }}/>
          </stackNavigator.Navigator>
        </NavigationContainer>
      </StyleProvider>
    )
  } else {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          <StatusBar backgroundColor={theme.LIGHT_COLOR} style={"dark"}/>
          <NavigationContainer>
            <Root>
            <mainStackNavigator.Navigator initialRouteName="Home" screenOptions={{
              headerShown: false,
              cardStyle: { paddingTop: Constants.statusBarHeight + 10 }
            }}>
              <mainStackNavigator.Screen name="Home" component={HomeScreen} />
              <mainStackNavigator.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
              <mainStackNavigator.Screen name="Account" 
                options={{gestureDirection: 'horizontal-inverted'}} 
                component={ProfileScreen} />
              <mainStackNavigator.Screen name="Social" component={SocialScreen} />
              <mainStackNavigator.Screen name="Search" component={SearchScreen} />
            </mainStackNavigator.Navigator>
            </Root>
          </NavigationContainer>  
        </Container>
      </StyleProvider>
    );
  }
}
