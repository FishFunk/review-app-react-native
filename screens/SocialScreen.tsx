import React from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../components/AppHeader";
import SocialContainer from '../components/social/SocialContainer';

export default function SocialScreen(props: any){
    return(
        <Container>
            <AppHeader 
                onPressButton={props.navigation.goBack} 
                buttonIconName={'arrow-left'} 
                title={'Friend Finder'}
                rightButtonIconName={'search'}
                onPressRightButton={()=> props.navigation.navigate('Search')}/>
            <Content contentContainerStyle={styles.container}>
                <SocialContainer />
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
  