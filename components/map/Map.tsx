import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, MapEvent, Callout, Region } from 'react-native-maps';
import theme from '../../styles/theme';
import mapJson from '../../constants/MapJson';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import { marker } from '../../models/place';

export default class Map extends React.Component<
    {
        region: Region,
        markers: Array<marker>,
        onPress: (event: MapEvent) => void,
        onMarkerSelect: Function,
        onRegionChange: (region: Region) => void
    },
    {}>{

    mapViewRef: MapView | null = null;
    markerRef: Marker | null  = null;

    onPressMarker(event: MapEvent<{ action: "marker-press"; id: string }>){
        this.props.onMarkerSelect(event.nativeEvent);
    }

    onPoiClick(event: MapEvent<{ placeId: string; name: string }>){
        this.props.onMarkerSelect(event.nativeEvent);
    }

    onRegionChange(region: Region){
        this.markerRef?.hideCallout();
        this.props.onRegionChange(region);
    }

    render() {
        return (
            <MapView
                ref={ref => this.mapViewRef = ref}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                region={this.props.region}
                onRegionChangeComplete={this.onRegionChange.bind(this)} 
                showsMyLocationButton={true}
                zoomControlEnabled={true}
                zoomTapEnabled={true}
                onPoiClick={this.onPoiClick.bind(this)}
                onMarkerPress={this.onPressMarker.bind(this)}
                onPress={this.props.onPress}
                customMapStyle={mapJson}
            >
                {this.props.markers.map((marker: marker, idx: number) => (
                    <Marker
                        ref={ref => this.markerRef = ref}
                        key={idx}
                        identifier={marker.title}
                        coordinate={marker.latlng}
                        pinColor={theme.SECONDARY_COLOR}
                    >
                        <Callout tooltip>
                            <View>
                                <View style={styles.bubble}>
                                    <Title>{marker.title}</Title>
                                    {
                                        marker.rating ?
                                        <View style={styles.stars}><ReviewStars rating={5} fontSize={12}/></View> :
                                        <Text>No Reviews</Text>
                                    }
                                    {
                                        marker.description ?
                                        <Text>{marker.description}</Text> : null
                                    }
                                </View>
                                <View style={styles.arrow}/>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        )
    }
}

const styles = StyleSheet.create({
    bubble: {
        alignSelf: 'center',
        backgroundColor: theme.LIGHT_COLOR,
        borderRadius: 6,
        borderColor: theme.DARK_COLOR,
        borderWidth: 0.5,
        padding: 15,
        width: 150
    },
    stars: {
        alignSelf: 'center'
    },
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: theme.PRIMARY_COLOR,
        borderWidth: 16,
        alignSelf: 'center',
        marginTop: -0.5
    }
});