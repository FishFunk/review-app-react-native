import * as React from 'react';
import { StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import theme from '../styles/theme';
import { Text, View } from '../components/Themed';
import FirebaseService from '../services/firebaseService';

export default function RegisterScreen(props: any) {

    const [email, onChangeEmail] = React.useState('');
    const [pwd, onChangePwd] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    const onRegister = ()=>{
        alert("not implemented");
        setError(false);
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
          <View style={styles.container}>
              <Text style={styles.title}>Join Us!</Text>
              <Text style={styles.warning}>
                {isError? 'Registration Failed!': ''}
              </Text>
                <TextInput
                  placeholder='Name'
                  style={styles.input}
                  onChangeText={text => onChangeEmail(text)}
                  value={email} />
                <TextInput
                  placeholder='Email'
                  style={styles.input}
                  onChangeText={text => onChangeEmail(text)}
                  value={email} />
              <TextInput
                  placeholder='Confirm Email'
                  style={styles.input}
                  onChangeText={text => onChangeEmail(text)}
                  value={email} />
              <View style={styles.separator} />
              <View style={styles.buttonGroup}>
                <Button color={theme.PRIMARY_COLOR} title="Register" onPress={onRegister} />
              </View>
              <View style={styles.separator}></View>
              <View style={styles.buttonGroup}>
                <Button color={theme.PRIMARY_COLOR} title="Cancel" onPress={onCancel} />
              </View>
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
    marginVertical: 10,
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
