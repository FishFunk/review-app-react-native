import React from "react";
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { 
  Button,
  Icon,
  Root,
  Text, 
  Toast, 
  View
} from "native-base";
import AppIntroSlider from 'react-native-app-intro-slider';
import UndrawReviewSvg from "../svgs/undraw_reviews";
import theme from "../styles/theme";
import Constants, { AppOwnership } from 'expo-constants';
import FirebaseService from '../services/firebaseService';
import UndrawFeedbackSvg from "../svgs/undraw_feedback";
import UndrawNeighborsSvg from "../svgs/undraw_neighbors";
import { AppleAuth } from "../components/AppleAuthentication";

export default function IntroScreen(props: any) {
    const buttonWidth = 160;
    const buttonFontSize = 16;
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.LIGHT_COLOR
      },
      slide: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingBottom: 100
      },
      title: {
        fontSize: 30,
        fontFamily: theme.fontBold,
        marginTop: 50,
        marginLeft: 20, 
        marginRight: 20,
        marginBottom: 30,
        textAlign: 'center'
      },
      text: {
        fontSize: 18,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        textAlign: 'center'
      },
      subText: {
        fontSize: 14,
        fontFamily: theme.fontLight
      },
      buttonGroup: {
        width: '100%',
        justifyContent: "space-evenly",
        flexDirection: 'row',
        backgroundColor: 'transparent'
      },
      facebookButton: {
        width: buttonWidth,
        borderWidth: 1,
        borderColor: theme.facebookBlue,
        borderRadius: 0
      },
      facebookText: {
        fontWeight: 'bold',
        color: theme.facebookBlue,
        fontSize: buttonFontSize
      },
      facebookIcon: {
        color: theme.facebookBlue,
      },
      googleButton: {
        width: buttonWidth,
        borderWidth: 1,
        borderColor: theme.googleRed,
        borderRadius: 0
      },
      googleText: {
        fontWeight: 'bold',
        fontSize: buttonFontSize,
        color: theme.googleRed
      },
      googleIcon: {
        color: theme.googleRed
      },
      pagingIcon: {
        color: theme.LIGHT_COLOR,
        fontSize: 22
      },
      pagingCircle: {
        width: 40,
        height: 40,
        backgroundColor: theme.PRIMARY_COLOR,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }
    });

    const slides = [
        {
          key: 1,
          title: 'Welcome to NoBull!',
          text: 'Tired of sifting through hundreds of 💩 reviews written by strangers or bots?\nWe are too...',
          image: require('../assets/svg/undraw_neighbors.svg')
        },
        {
          key: 2,
          title: 'Reviews You Can Trust',
          text: 'Our platform allows you to follow people you trust so that you only see their reviews on your map.',
          image: require('../assets/svg/undraw_neighbors.svg')
        },
        {
          key: 3,
          title: 'Ready to Get Started?',
          text: 'Join our community,\n because your opinions matter!',
          image: require('../assets/svg/undraw_neighbors.svg')
        }
    ];

    const onFacebookLogin = ()=>{
      if(Constants.appOwnership === AppOwnership.Standalone){
        FirebaseService.loginWithFacebook()
        .then(result=>{
          console.log(result.message);
        })
        .catch(error =>{
          Toast.show({ text: 'Login Failed!', position: 'bottom', duration: 3000 });
          console.error(error);
          FirebaseService.logError(error, 'IntroScreen - onFacebookLogin');
        });
      } else {
        Toast.show({ text: "Facebook login does not work in Expo", position: 'bottom', duration: 5000, buttonText: 'OK' });
      }
    }

    const onGoogleLogin = ()=>{
      FirebaseService.loginWithGoogle()
        .then(result=>{
          console.log(result.message);
        })
        .catch(error =>{
          Toast.show({ text: 'Login Failed!', position: 'bottom', duration: 3000 });
          console.error(error);
          FirebaseService.logError(error, 'IntroScreen - onGoogleLogin');
        });
    }

    const _getSvg = (key: number) => {
      switch(key){
        case(1):
          return (<UndrawFeedbackSvg width='100%' height='200px' />);
        case(2):
          return (<UndrawNeighborsSvg width='90%' height='200px' />);
        case(3):
          return (<UndrawReviewSvg width='100%' height='200px' />);
      } 
    }

    const _renderItem = ({ item } : any) => {
        return (
          <View>
            {
              item.key !== 3 ?
                <View style={styles.slide}>
                  <Text style={styles.title}>{item.title}</Text>
                  {_getSvg(item.key)}
                  <Text style={styles.text}>{item.text}</Text>
                </View>
                :
                <View style={styles.slide}>
                  <Text style={styles.title}>{item.title}</Text>
                  {_getSvg(item.key)}
                  <Text style={styles.text}>{item.text}</Text>
                  <Text style={styles.subText}>
                    Login With
                  </Text>
                  <View style={styles.buttonGroup}>
                    <Button transparent style={styles.facebookButton} onPress={onFacebookLogin}>
                      <Text style={styles.facebookText}>Facebook</Text>
                      <Icon style={styles.facebookIcon} type={"FontAwesome5"} name="facebook"></Icon>
                    </Button>
                    <Button transparent style={styles.googleButton} onPress={onGoogleLogin}>
                      <Text style={styles.googleText}>Google</Text>
                      <Icon style={styles.googleIcon} type={"FontAwesome5"} name="google"></Icon>
                    </Button>
                  </View>
                  { Platform.OS === 'ios' ? <AppleAuth/> : null }
                </View>
            } 
          </View>
        );
    }

    const _renderNextButton = () => {
      return (
        <View style={styles.pagingCircle}>
          <Icon
            type={'FontAwesome5'}
            name="arrow-right"
            style={styles.pagingIcon}
          />
        </View>
      );
    };

    // const _renderPrevButton = () => {
    //   return (
    //     <View style={styles.pagingCircle}>
    //       <Icon
    //         type={'FontAwesome5'}
    //         name="arrow-left"
    //         style={styles.pagingIcon}
    //       />
    //     </View>
    //   );
    // };

    return (
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
        <Root>
        <AppIntroSlider 
          keyExtractor={item => item.key.toString()}
          renderItem={_renderItem} 
          data={slides} 
          showDoneButton={false} 
          // showPrevButton={true} 
          renderNextButton={_renderNextButton}
          dotStyle={{ backgroundColor: theme.GRAY_COLOR }}
          activeDotStyle={{ backgroundColor: theme.SECONDARY_COLOR }}
          // renderPrevButton={_renderPrevButton}
          />
        </Root>
      </ScrollView>
    );
}