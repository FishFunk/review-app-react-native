import React from "react";
import { StyleSheet } from 'react-native';
import { 
  Container, 
  Content} from "native-base";
import PlaceDetails from "../components/map/PlaceDetails";

export default function PlaceDetailsScreen(props: any) {

    const styles = StyleSheet.create({
        container: {
        }
      });

    return (
      <Container>
        <Content contentContainerStyle={styles.container}>
            <PlaceDetails 
                navigation={props.navigation}
                apiKey={props.route.params.apiKey}
                placeId={props.route.params.placeId} 
                toggleSummaryModal={props.navigation.goBack}/>
        </Content>
      </Container>
    );
}
  