import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../../styles/theme';
import FirebaseService from '../../services/firebaseService';
import { Content, Button, Item, Input, Text } from 'native-base';

export default function RegisterScreen(props: any) {

    const [email, onChangeEmail] = React.useState('');
    const [pwd, onChangePwd] = React.useState('');
    const [firstName, onChangeFirstName] = React.useState('');
    const [lastName, onChangeLastName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    const onRegister = ()=>{
        FirebaseService.registerUser(firstName, lastName, email, pwd)
          .catch(error => {
            console.error(error);
            setError(true);
          });
    }

    const onCancel = ()=>{
        props.navigation.goBack();
    }

    if(loading){
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={ theme.LIGHT_COLOR }/>
        </View>
      )
    } else {
      return (
          <Content contentContainerStyle={styles.container}>
              <Text style={styles.title}>Glad You Could Join Us!</Text>
              <Text style={styles.warning}>
                {isError? 'Registration Failed!': ''}
              </Text>
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='First Name'
                  onChangeText={text => onChangeFirstName(text)}
                  value={firstName} />
              </Item>
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='Last Name'
                  onChangeText={text => onChangeLastName(text)}
                  value={lastName} />
              </Item>
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='Email'
                  onChangeText={text => onChangeEmail(text)}
                  value={email}
                  textContentType='emailAddress' />
              </Item>
              <Item style={styles.inputItem}>
                <Input 
                  placeholder='Password'
                  onChangeText={text => onChangePwd(text)}
                  value={pwd} 
                  textContentType='password'
                  secureTextEntry={true} />
              </Item>
              <View style={styles.separator} />
              <View style={styles.buttonGroup}>
                <Button transparent style={styles.registerButton} onPress={onRegister}>
                  <Text style={styles.registerText}>Submit</Text>
                </Button>
                <Button transparent style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
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
  registerButton: {
    borderWidth: 1,
    borderColor: theme.SECONDARY_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.DANGER_COLOR,
    width: 100,
    justifyContent: 'center'
  },
  cancelText: {
    color: theme.DANGER_COLOR
  },
  registerText: {
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
