import * as React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Text, View } from '../components/Themed';
import { Button, Item, Input, Content } from 'native-base';

import FirebaseService from '../services/firebaseService';
import { color } from 'react-native-reanimated';

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
              <Text style={styles.title}>Welcome!</Text>
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
              <View style={styles.separator} />
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
    color: theme.LIGHT_COLOR
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
    backgroundColor: theme.DARK_COLOR
  },
  title: {
    color: theme.LIGHT_COLOR,
    fontSize: 30,
    fontWeight: 'bold'
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
  inputItem: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15
  }
});
