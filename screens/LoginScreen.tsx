import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Button, Item, Input, Content, Text } from 'native-base';
import UndrawReviewSvg from '../svgs/undraw_reviews';
import FirebaseService from '../services/firebaseService';

export default function LoginScreen(props: any) {

    const [email, onChangeEmail] = React.useState('');
    const [pwd, onChangePwd] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    const onSubmit = ()=>{
      setLoading(true);
      FirebaseService.login(email, pwd)
        .then(result=>{
          console.log(result.message);
        })
        .catch((error)=>{
          setError(true);
          console.error(error);
        })
        .finally(()=>{
          setLoading(false);
        });
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
          <ActivityIndicator size="large" color={ theme.LIGHT_COLOR }/>
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
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='Email'
                  onChangeText={text => onChangeEmail(text)}
                  value={email} />
              </Item>
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='Password'
                  onChangeText={text => onChangePwd(text)}
                  value={pwd} 
                  secureTextEntry={true} />
              </Item>
              <View style={styles.buttonGroup}>
                <Button transparent style={styles.loginButton} onPress={onSubmit}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </Button>
                <Button transparent style={styles.registerButton} onPress={onRegister}>
                  <Text style={styles.registerButtonText}>Register</Text>
                </Button>
              </View>
              <View style={styles.smallSeparator} />
              <Button full style={styles.facebookButton} onPress={onFacebookLogin}>
                <Text style={styles.facebookText}>Login with Facebook</Text>
                {/* <Icon type={"FontAwesome5"} name="facebook"></Icon> */}
              </Button>
              <Button style={styles.forgotButton} full>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Button>
          </Content>
      );
    }
}

const styles = StyleSheet.create({
  margin: {
    marginHorizontal: 10
  },
  buttonGroup: {
    width: '100%',
    justifyContent: "space-evenly",
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  loginButton: {
    borderWidth: 1,
    borderColor: theme.PRIMARY_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  registerButton: {
    borderWidth: 1,
    borderColor: theme.SECONDARY_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  forgotButton: {
    backgroundColor: 'transparent'
  },
  forgotText: {
    color: theme.PRIMARY_COLOR
  },
  loginButtonText: {
    color: theme.PRIMARY_COLOR
  },
  registerButtonText: {
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
  separator: {
    marginVertical: 20,
    width: '80%',
  },
  smallSeparator: {
    marginVertical: 10,
    width: '80%',
  },
  inputItem: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15
  },
  svgWrapper: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  facebookButton: {
    backgroundColor: theme.facebookBlue,
    justifyContent: 'center'
  },
  facebookText: {
    fontWeight: 'bold',
    color: '#fff'
  }
});
