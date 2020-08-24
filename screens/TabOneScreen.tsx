import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';

import Map from '../components/Map';

export default function TabOneScreen() {

  return (
    <View style={styles.container}>
      <Map/>
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
