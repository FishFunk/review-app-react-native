import React, { useState } from "react";
import { ScrollView, StyleSheet } from 'react-native';
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

export default function IntroScreen(props: any) {
    const buttonWidth = 160;
    const buttonFontSize = 16;
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.SECONDARY_COLOR
      },
      slide: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 100
      },
      title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 50,
        marginLeft: 20, 
        marginRight: 20,
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Nunito-Bold'
      },
      text: {
        fontSize: 18,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        fontFamily: 'Nunito-Regular',
        textAlign: 'center'
      },
      subText: {
        fontSize: 14,
        fontFamily: 'Nunito-Light'
      },
      buttonGroup: {
        width: '100%',
        justifyContent: "space-around",
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
      warning: {
        color: theme.DANGER_COLOR,
        fontSize: 12,
        fontFamily: 'Nunito-Bold'
      }
    });

    const slides = [
        {
          key: 1,
          title: 'Welcome to ReVew!',
          text: 'Tired of sifting through hundreds of reviews written by strangers? We are too...',
          image: require('../assets/svg/undraw_neighbors.svg'),
          backgroundColor: '#59b2ab',
        },
        {
          key: 2,
          title: 'Reviews You Can Trust',
          text: 'Our platform allows you to follow people you trust so that you see only their reviews on your map.',
          image: require('../assets/svg/undraw_neighbors.svg'),
          backgroundColor: '#febe29',
        },
        {
          key: 3,
          title: 'Ready to Get Started?',
          text: 'Signing up is easy!\nYour opinions matter.',
          image: require('../assets/svg/undraw_neighbors.svg'),
          backgroundColor: '#22bcb5',
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
          FirebaseService.logError(error);
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
          setError(true);
          console.error(error);
          FirebaseService.logError(error);
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
                    Log In With
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
                </View>
            } 
          </View>
        );
    }

    return (
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
        <Root>
        <AppIntroSlider 
          keyExtractor={item => item.key.toString()}
          renderItem={_renderItem} 
          data={slides} 
          showDoneButton={false} 
          showPrevButton={true} />
        </Root>
      </ScrollView>
    );
}