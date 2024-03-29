import React from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import AppHeader from "../components/AppHeader";
import ProfileContainer from "../components/profile/ProfileConatiner";
import theme from "../styles/theme";

export default function ProfileScreen(props: any) {
    return (
      <Container>
        <AppHeader onPressButton={props.navigation.goBack} buttonIconName={'arrow-left'} title={'Profile'}/>
        <Content contentContainerStyle={styles.container} scrollEnabled={false}>
            <ProfileContainer navigation={props.navigation}/>
        </Content>
      </Container>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.LIGHT_COLOR
    }
  });
  