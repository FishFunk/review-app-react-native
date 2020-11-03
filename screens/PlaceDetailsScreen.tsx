import React from "react";
import { StyleSheet } from 'react-native';
import { View } from "native-base";
import PlaceDetails from "../components/map/PlaceDetails";

export default function PlaceDetailsScreen(props: any) {

    const styles = StyleSheet.create({
        container: {
          flex: 1, 
          marginTop: 20 
        }
      });

    return (
      <View style={styles.container}>
        <PlaceDetails 
            navigation={props.navigation}
            apiKey={props.route.params.apiKey}
            placeId={props.route.params.placeId} 
            toggleSummaryModal={props.navigation.goBack}/>
      </View>
    );
}
  