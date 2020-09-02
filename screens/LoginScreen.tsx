import * as React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Text, View } from '../components/Themed';
import { Button, Item, Input, Content } from 'native-base';
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
        .catch((error)=>{
          setError(true);
          // console.error(error);
        })
        .finally(()=>{
          setLoading(false);
        });
    }

    const onRegister = ()=>{
      props.navigation.push('Register');
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
              <View style={styles.separator} />
              <View style={styles.buttonGroup}>
                <Button style={styles.loginButton} onPress={onSubmit}>
                  <Text style={styles.buttonText}>Login</Text>
                </Button>
                <Button style={styles.registerButton} onPress={onRegister}>
                  <Text style={styles.buttonText}>Register</Text>
                </Button>
              </View>
              <View style={styles.smallSeparator} />
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
    backgroundColor: theme.PRIMARY_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  registerButton: {
    backgroundColor: theme.SECONDARY_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  forgotButton: {
    backgroundColor: 'transparent'
  },
  forgotText: {
    color: theme.PRIMARY_COLOR
  },
  buttonText: {
    color: theme.DARK_COLOR,
    textShadowColor: theme.LIGHT_COLOR,
    textShadowRadius: 5,
    textShadowOffset: { width: 1, height: 1}
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
  }
});
