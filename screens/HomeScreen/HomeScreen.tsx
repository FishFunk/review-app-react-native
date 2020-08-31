import React, { useState } from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../../components/AppHeader";
import MapContainer from '../../components/map/MapContainer';
import SlideUpPanelContainer from '../../components/SlideUpPanelContainer';

export default function HomeScreen(props: any) {

    const [isSlideUpPanelOpen, setSlideUpPanelOpen] = useState(false);

    function onToggleSlideUpPanel(force?: boolean){
      if(force != null){
        setSlideUpPanelOpen(force);
      } else {
        setSlideUpPanelOpen(!isSlideUpPanelOpen);
      }
    }

    return (
      <Container>
        <AppHeader toggleDrawer={props.navigation.openDrawer}/>
        <Content contentContainerStyle={styles.container}>
        <MapContainer toggleSlideUpPanel={onToggleSlideUpPanel} />
        </Content>
        <SlideUpPanelContainer isOpen={isSlideUpPanelOpen} />
      </Container>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});