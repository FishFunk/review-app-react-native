import React from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../components/AppHeader";

export default function SocialScreen(props: any){
    return(
        <Container>
            <AppHeader 
                onPressButton={props.navigation.goBack} 
                buttonIconName={'arrow-back'} 
                title={'Friend Finder'}/>
            <Content contentContainerStyle={styles.container}>

            </Content>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
});
  