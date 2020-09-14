import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Button, Content, Text, Icon } from 'native-base';
import UndrawReviewSvg from '../svgs/undraw_reviews';
import FirebaseService from '../services/firebaseService';

export default function LoginSocialScreen(props: any) {

    const [isError, setError] = React.useState(false);

    const onFacebookLogin = ()=>{
      FirebaseService.signInWithFacebook()
        .then(result=>{
          console.log(result.message);
        })
        .catch(error =>{
          setError(true);
          console.error(error);
          FirebaseService.logError(error);
        })
    }

    const onGoogleLogin = ()=>{
      FirebaseService.signInWithGoogleAsync()
        .then(result=>{
          console.log(result.message);
        })
        .catch(error =>{
          setError(true);
          console.error(error);
          FirebaseService.logError(error);
        });
    }

    return (
        <Content contentContainerStyle={styles.container}>
            <View style={styles.svgWrapper}>
              <UndrawReviewSvg width='75%' height='200px'/>
            </View>
            <Text style={styles.title}>It's time we reviewed our reviews</Text>
            <Text style={styles.subtext}>
              Welcome to Reviewly! Real reviews from people you trust.
            </Text>
            <Text style={styles.warning}>
              {isError? 'Login Failed!': ''}
            </Text>
            <Text style={styles.subtext}>
              Log In With
            </Text>
            <View style={styles.smallSeparator}/>
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
            {/* <View style={styles.smallSeparator}/>
            <Text style={styles.subtext}>
              Or
            </Text>
            <View style={styles.smallSeparator}/>
            <View style={styles.buttonGroup}>
              <Button transparent small style={styles.emailButton} onPress={onLoginWithEmail}>
                <Text style={styles.emailButtonText}>Email</Text>
                <Icon style={styles.emailIcon} type={"FontAwesome5"} name="envelope"></Icon>
              </Button>
              <Button transparent small style={styles.registerButton} onPress={onRegister}>
                <Text style={styles.registerButtonText}>Sign Up</Text>
                <Icon style={styles.registerIcon} type={"FontAwesome5"} name="sign-in-alt"></Icon>
              </Button>
            </View> */}
        </Content>
    );
}

const buttonWidth = 160;
const buttonFontSize = 16;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.LIGHT_COLOR
  },
  title: {
    color: theme.DARK_COLOR,
    fontSize: 20,
    fontWeight: 'bold'
  },
  subtext: {
    marginTop: 15,
    marginRight: '10%',
    marginLeft: '10%',
    textAlign: 'center',
    color: theme.DARK_COLOR,
    fontSize: 16
  },
  buttonGroup: {
    width: '100%',
    justifyContent: "space-around",
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  emailButton: {
  },
  emailButtonText: {
    fontWeight: 'bold',
    fontSize: buttonFontSize - 4,
    color: theme.PRIMARY_COLOR,
    textAlign: 'center'
  },
  emailIcon: {
    color: theme.PRIMARY_COLOR
  },
  registerButton: {
  },
  registerButtonText: {
    fontWeight: 'bold',
    fontSize: buttonFontSize - 4,
    color: theme.SECONDARY_COLOR
  },
  registerIcon: {
    color: theme.SECONDARY_COLOR
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
    marginVertical: 10,
    color: theme.DANGER_COLOR,
    fontSize: 12,
    fontWeight: 'bold'
  },
  smallSeparator: {
    marginVertical: 10,
    width: '80%',
  },
  svgWrapper: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)'
  }
});
