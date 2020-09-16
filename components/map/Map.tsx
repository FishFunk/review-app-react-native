import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, MapEvent, Callout, Region } from 'react-native-maps';
import theme from '../../styles/theme';
import mapJson from '../../constants/MapJson';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import { marker } from '../../models/place';

export default class Map extends React.Component<
    {
        region: Region,
        markers: Array<marker>,
        onPress: (event: MapEvent) => void,
        onMarkerSelect: Function,
        onPoiSelect: Function,
        onRegionChange: (region: Region) => void,
        onShowDetails: Function
    },
    {}>{

    mapViewRef: MapView | null = null;
    markerRef: Marker | null  = null;

    onPressMarker(event: MapEvent<{ action: "marker-press"; id: string }>){
        event.preventDefault();
        this.props.onMarkerSelect(event.nativeEvent);
    }

    onPoiClick(event: MapEvent<{ placeId: string; name: string }>){
        event.preventDefault();
        this.props.onPoiSelect(event.nativeEvent);
    }

    onRegionChange(region: Region){
        this.markerRef?.hideCallout();
        this.props.onRegionChange(region);
    }

    onMapPress(event: MapEvent<{}>){
        event.preventDefault();
        this.props.onPress(event);
    }

    onPressCallout(event: MapEvent<{}>){
        this.props.onShowDetails(event.nativeEvent);
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
                onPress={this.onMapPress.bind(this)}
                customMapStyle={mapJson}
            >
                {this.props.markers.map((marker: marker, idx: number) => (
                    <Marker
                        ref={ref => this.markerRef = ref}
                        key={idx}
                        identifier={marker.title}
                        coordinate={marker.latlng}
                        pinColor={theme.SECONDARY_COLOR}
                        onPress={this.onPressMarker.bind(this)}
                    >
                        <Callout tooltip onPress={this.onPressCallout.bind(this)}>
                            <View>
                                <View style={styles.bubble}>
                                    <Title>{marker.title}</Title>
                                    {
                                        marker.rating ?
                                        <View style={styles.stars}><ReviewStars rating={5} fontSize={12}/></View> :
                                        <Text style={styles.subtext}>No Reviews</Text>
                                    }
                                    {
                                        marker.description ?
                                        <Text style={styles.subtext}>{marker.description}</Text> : null
                                    }
                                    <Button 
                                        small 
                                        transparent 
                                        style={styles.button}
                                        ><Text>Details</Text></Button>
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
        minWidth: 150,
        maxWidth: 250
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
    },
    button: {
        alignSelf: 'center'
    },
    subtext: {
        alignSelf: 'center'
    }
});