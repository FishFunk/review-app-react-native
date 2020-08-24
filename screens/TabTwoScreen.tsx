import * as React from 'react';
import { StyleSheet, Button } from 'react-native';
import { Text, View } from '../components/Themed';
import FirebaseService from '../services/firebaseService';

export default function TabTwoScreen() {

  const logout = ()=>{
    FirebaseService.signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <Button title="Logout" onPress={logout}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
