import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';

import MapContainer from '../components/MapContainer';

export default function TabOneScreen() {

  return (
    <View style={styles.container}>
      <MapContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
