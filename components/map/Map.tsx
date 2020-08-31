import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, MapEvent } from 'react-native-maps';

export default function Map(props: any) {

    // const [isLoading, setLoading] = useState(false);
    // const [markers, setMarkers] = useState([]);

    let mapViewRef;

    function onPressMarker(event: MapEvent<{ action: "marker-press"; id: string }>){
        props.onMarkerSelect(event.nativeEvent);
    }

    function onPoiClick(event: MapEvent<{ placeId: string; name: string }>){
        props.onMarkerSelect(event.nativeEvent);
    }

    function onPress(){
        props.onPress();
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
            onPoiClick={onPoiClick}
            onMarkerPress={onPressMarker}
            onPress={onPress}
        >
            {props.markers.map((marker: any, idx: number) => (
                <Marker
                    key={idx}
                    identifier={marker.title}
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                />
            ))}
        </MapView>
    )
}
