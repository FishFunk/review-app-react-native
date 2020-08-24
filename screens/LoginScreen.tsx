import * as React from 'react';
import { StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Text, View } from '../components/Themed';

import FirebaseService from '../services/firebaseService';

export default function LoginScreen() {

    const [email, onChangeEmail] = React.useState('');
    const [pwd, onChangePwd] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    const onSubmit = ()=>{
      setLoading(true);
      FirebaseService.login(email, pwd)
        .catch((error)=>{
          setError(true);
          console.error(error);
        })
        .finally(()=>{
          setLoading(false);
        });
    }

    if(loading){
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={ theme.DARK_COLOR }/>
        </View>
      )
    } else {
      return (
          <View style={styles.container}>
              <Text style={styles.title}>Welcome!</Text>
              {isError ? <Text style={styles.warning}>Login Failed!</Text> : null }
              <View style={styles.separator} />
              <TextInput
                  placeholder='Email'
                  style={styles.input}
                  onChangeText={text => onChangeEmail(text)}
                  value={email} />
              <TextInput
                  placeholder='Password'
                  style={styles.input}
                  onChangeText={text => onChangePwd(text)}
                  value={pwd} 
                  secureTextEntry={true}/>
              <View style={styles.separator} />
              <View style={styles.buttonGroup}>
                <Button color={theme.SECONDARY_COLOR} title="Login" onPress={onSubmit} />
                <View style={styles.margin} />
                <Button color={theme.PRIMARY_COLOR} title="Register" onPress={()=>{}} />
              </View>
              <View style={styles.separator} />
              <Button color={theme.DARK_COLOR} title="Forgot Password?" onPress={()=>{}} />
          </View>
      );
    }
}

const styles = StyleSheet.create({
  margin: {
    marginHorizontal: 10
  },
  buttonGroup: {
    flexDirection: 'row',
    backgroundColor: 'transparent'
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
    paddingTop: 10,
    color: theme.DANGER_COLOR,
    fontSize: 12,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 20,
    width: '80%',
  },
  input: {
    width: '90%',
    backgroundColor: theme.LIGHT_COLOR,
    padding: 15,
    marginBottom: 10,
    borderColor: theme.DARK_COLOR,
    borderWidth: 1
  },
  button: {
    color: theme.DARK_COLOR,
    backgroundColor: theme.SECONDARY_COLOR
  }
});
