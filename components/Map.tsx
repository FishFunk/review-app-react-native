import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Dimensions } from 'react-native';
import { View } from '../components/Themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLinkProps } from '@react-navigation/native';

export default function Map(props: any) {

    const [isLoading, setLoading] = useState(false);
    const [markers, setMarkers] = useState([]);

    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={{flex: 1}}
            region={props.region}
            onRegionChangeComplete={props.onRegionChange} 
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
