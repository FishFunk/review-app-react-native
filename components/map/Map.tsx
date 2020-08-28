import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, MapEvent } from 'react-native-maps';

export default function Map(props: any) {

    // const [isLoading, setLoading] = useState(false);
    // const [markers, setMarkers] = useState([]);

    let mapViewRef;

    function onPressMarker(event: MapEvent<{ action: "marker-press"; id: string }>){
        console.log(event.nativeEvent.coordinate);
    }

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
            {props.markers.map((marker: any) => (
                <Marker
                    onPress={onPressMarker}
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                />
            ))}
        </MapView>
    )
}
