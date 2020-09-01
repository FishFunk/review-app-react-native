import React, { useState } from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../../components/AppHeader";
import MapContainer from '../../components/map/MapContainer';

export default function HomeScreen(props: any) {

    return (
      <Container>
        <AppHeader toggleDrawer={props.navigation.openDrawer}/>
        <Content contentContainerStyle={styles.container}>
          <MapContainer />
        </Content>
      </Container>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});