import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, MapEvent, Callout, Region, MarkerAnimated, AnimatedRegion } from 'react-native-maps';
import theme from '../../styles/theme';
// import mapJson from '../../constants/MapJson';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { Text } from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import { markerData } from '../../models/place';
import _isEqual from 'lodash/isEqual';
import DropDown from '../animations/DropDown';

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
    markerRef: MarkerAnimated | null  = null;

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
                    <MarkerAnimated
                        ref={ (ref) => this.markerRef = ref }
                        key={idx}
                        identifier={marker.title}
                        coordinate={marker.latlng}
                        onPress={(event)=>this.onPressMarker(event, marker)}
                    >
                        {marker.icon?
                            <View>
                                <View style={styles.pinBubble}>
                                    <Image 
                                        source={{uri: marker.icon}} 
                                        style={styles.pinImage} />
                                </View>
                                <View style={styles.pinArrow}/>
                            </View>
                            :                             
                            <View>
                                <View style={styles.pinBubble}>
                                    <View style={styles.pinDot}/>
                                </View>
                                <View style={styles.pinArrow}/>
                            </View>
                        }
                        <Callout 
                            tooltip 
                            onPress={(event)=>this.onPressCallout(event, marker)}>
                            <View style={styles.bubble}>
                                <Text style={styles.title}>{marker.title}</Text>
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
                    </MarkerAnimated>
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
        maxWidth: 280
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
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
    },
    pinBubble: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 30, width: 30,
        backgroundColor: theme.LIGHT_COLOR,
        borderColor: theme.DARK_COLOR,
        borderWidth: 0.5,
        borderRadius: 15 
    },
    pinImage: {
        alignSelf: 'center',
        height: 18, 
        width: 18
    },
    pinDot: {
        alignSelf: 'center',
        width: 10, 
        height: 10,
        backgroundColor: theme.PRIMARY_COLOR,
        borderRadius: 9
    },
    pinArrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: theme.PRIMARY_COLOR,
        borderTopWidth: 10,
        borderLeftWidth: 1,
        borderLeftColor: theme.DARK_COLOR,
        borderRightWidth: 1,
        borderRightColor: theme.DARK_COLOR,
        alignSelf: 'center'
    }
});