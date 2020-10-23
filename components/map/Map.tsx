import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, MapEvent, Callout, Region } from 'react-native-maps';
import theme from '../../styles/theme';
// import mapJson from '../../constants/MapJson';
import { View, StyleSheet, Platform } from 'react-native';
import { Title, Text } from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import { markerData } from '../../models/place';
import _isEqual from 'lodash/isEqual';

export default class Map extends React.Component<
    {
        region: Region,
        markers: Array<markerData>,
        refreshCallout: boolean,
        setMapRef: (ref: MapView | null) => void,
        onPress: () => void,
        onMarkerSelect: (marker: markerData) => void,
        onPoiSelect: (placeId: string) => void,
        onRegionChange: (region: Region, markerRef: Marker | null) => void,
        onShowDetails: (placeId: string) => void
    },
    {}>{

    mapViewRef: MapView | null = null;
    markerRef: Marker | null  = null;

    componentDidUpdate(prevProps: any){
        if(!_isEqual(prevProps.markers, this.props.markers)){
            // refresh callout when a new review was written
            if(this.props.refreshCallout && Platform.OS === 'ios'){
                this.markerRef?.redrawCallout();
            } else {
                this.markerRef?.hideCallout();
                this.markerRef?.showCallout();
            }
        }
    }

    onPressMarker(event: MapEvent<{}>, marker: markerData){
        event.preventDefault();
        this.props.onMarkerSelect(marker);
    }

    onPoiClick(event: MapEvent<{ placeId: string; name: string }>){
        event.preventDefault();
        this.props.onPoiSelect(event.nativeEvent.placeId);
    }

    onRegionChange(region: Region){
        this.props.onRegionChange(region, this.markerRef);
    }

    onMapPress(event: MapEvent<{}>){
        event.preventDefault();
        this.props.onPress();
    }

    onPressCallout(event: MapEvent<{}>, marker: markerData){
        event.preventDefault();
        this.props.onShowDetails(marker.placeId);
    }

    setMapViewRef(ref: MapView | null){
        this.mapViewRef = ref;
        this.props.setMapRef(ref);
    }

    render() {
        return (
            <MapView
                ref={ref => this.setMapViewRef(ref)}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                region={this.props.region}
                onRegionChangeComplete={this.onRegionChange.bind(this)} 
                showsMyLocationButton={false}
                showsUserLocation
                zoomTapEnabled={true}
                onPoiClick={this.onPoiClick.bind(this)}
                onPress={this.onMapPress.bind(this)}
                // customMapStyle={mapJson}
            >
                {this.props.markers.map((marker: markerData, idx: number) => (
                    <Marker
                        ref={ref => this.markerRef = ref}
                        key={idx}
                        identifier={marker.title}
                        coordinate={marker.latlng}
                        pinColor={theme.SECONDARY_COLOR}
                        onPress={(event)=>this.onPressMarker(event, marker)}
                    >
                        <Callout 
                            tooltip 
                            onPress={(event)=>this.onPressCallout(event, marker)}>
                            <View style={styles.bubble}>
                                <Title style={styles.title}>{marker.title}</Title>
                                {
                                    marker.rating ?
                                    <View style={styles.stars}><ReviewStars rating={marker.rating} fontSize={12}/></View> :
                                    <Text style={styles.subtext}>No Reviews</Text>
                                }
                                {
                                    marker.description ?
                                    <Text style={styles.subtext}>{marker.description}</Text> : null
                                }
                                <Text style={styles.actionText}>Details</Text>
                            </View>
                            <View style={styles.arrow}/>
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
        borderColor: theme.PRIMARY_COLOR,
        borderWidth: 0.5,
        padding: 10,
        minWidth: 150,
        maxWidth: 250,
    },
    title: {
        fontSize: 16,
        color: theme.DARK_COLOR
    },
    stars: {
        alignSelf: 'center'
    },
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: theme.PRIMARY_COLOR,
        borderWidth: 10,
        alignSelf: 'center',
        marginTop: -0.5
    },
    actionText: {
        marginTop: 5,
        fontSize: 12,
        color: theme.PRIMARY_COLOR,
        alignSelf: 'center'
    },
    subtext: {
        alignSelf: 'center'
    }
});