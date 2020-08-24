import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Dimensions } from 'react-native';
import { View } from '../components/Themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Map() {

    const [markers, setMarkers] = useState([]);
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const onRegionChange = (region: any)=> {
        setRegion(region);
    }

    return (
        <MapView
            // provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            region={region}
            onRegionChange={onRegionChange} 
            showsMyLocationButton={true}
        >
            {markers.map((marker: any) => (
                <Marker
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                />
            ))}
        </MapView>
    )
}

const styles = StyleSheet.create({
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        marginBottom: 100
    }
});
