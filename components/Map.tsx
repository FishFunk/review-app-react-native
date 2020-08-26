import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';

export default function Map(props: any) {

    const [isLoading, setLoading] = useState(false);
    const [markers, setMarkers] = useState([]);

    let mapViewRef;

    return (
        <MapView
            ref={ref => (mapViewRef = ref)}
            provider={PROVIDER_GOOGLE}
            style={{flex: 1}}
            region={props.region}
            onRegionChangeComplete={props.onRegionChange} 
            showsMyLocationButton={true}
            zoomControlEnabled={true}
            zoomTapEnabled={true}
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
