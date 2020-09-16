import React from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../components/AppHeader";
import SearchContainer from '../components/social/SearchContainer';

export default function SearchScreen(props: any){
    return(
        <Container>
            <AppHeader 
                onPressButton={props.navigation.goBack} 
                buttonIconName={'arrow-left'} 
                title={'Friend Finder'}/>
            <Content contentContainerStyle={styles.container}>
                <SearchContainer />
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
  