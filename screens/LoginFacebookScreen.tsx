import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Button, Item, Input, Content, Text } from 'native-base';
import UndrawReviewSvg from '../svgs/undraw_reviews';
import FirebaseService from '../services/firebaseService';

export default function LoginFacebookScreen(props: any) {

    const [loading, setLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    const onLoginWithEmail = ()=>{
      props.navigation.push('LoginEmail');
    }

    const onRegister = ()=>{
      props.navigation.push('Register');
    }

    const onFacebookLogin = ()=>{
      FirebaseService.signInWithFacebook()
        .then(result=>{
          console.log(result.message);
        })
        .catch(error =>{
          setError(true);
          console.error(error);
        })
        .finally(()=>{
          setLoading(false);
        });
    }

    if(loading){
      return (
        <Content contentContainerStyle={styles.container}>
          <ActivityIndicator size="large" color={ theme.PRIMARY_COLOR }/>
        </Content>
      )
    } else {
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
              <Button style={styles.facebookButton} onPress={onFacebookLogin}>
                <Text style={styles.facebookText}>Login with Facebook</Text>
                {/* <Icon type={"FontAwesome5"} name="facebook"></Icon> */}
              </Button>
              <View style={styles.smallSeparator}/>
              <View style={styles.buttonGroup}>
                <Button transparent full style={styles.loginButton} onPress={onLoginWithEmail}>
                  <Text style={styles.loginButtonText}>Login with Email</Text>
                </Button>
                <Button transparent full style={styles.registerButton} onPress={onRegister}>
                  <Text style={styles.registerButtonText}>Sign Up with Email</Text>
                </Button>
              </View>
          </Content>
      );
    }
}

const styles = StyleSheet.create({
  buttonGroup: {
    width: '100%',
    justifyContent: "space-evenly",
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  loginButton: {
    width: 180,
    borderWidth: 1,
    borderColor: theme.PRIMARY_COLOR
  },
  registerButton: {
    width: 180,
    borderWidth: 1,
    borderColor: theme.SECONDARY_COLOR
  },
  loginButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR
  },
  registerButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.SECONDARY_COLOR
  },
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
  },
  facebookButton: {
    width: 180,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: theme.facebookBlue,
    borderRadius: 0
  },
  facebookText: {
    fontWeight: 'bold',
    color: theme.LIGHT_COLOR,
    fontSize: 14
  }
});
