import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, MapEvent, Callout, Region } from 'react-native-maps';
import theme from '../../styles/theme';
// import mapJson from '../../constants/MapJson';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { Text } from 'native-base';
import { placeMarkerData } from '../../models/place';
import _isEqual from 'lodash/isEqual';
import MapToolbar from './MapToolbar';
import StarRatingListItem from '../reviews/StarRatingListItem';
import ReviewDollars from '../reviews/ReviewDollars';

export default class Map extends React.Component<
    {
        region: Region,
        markers: Array<placeMarkerData>,
        refreshCallout: boolean,
        setMapRef: (ref: MapView | null) => void,
        onPress: () => void,
        onMarkerSelect: (marker: placeMarkerData) => void,
        onPoiSelect: (placeId: string) => void,
        onRegionChange: (region: Region, markerRef: Marker | null) => void,
        onShowDetails: (placeSummary: placeMarkerData) => void,
        loadingLocation: boolean,
        loadingNearby: boolean,
        onPressCurrentLocation: () => any,
        onPressListView: () => any,
        onPressLoadNearby: () => any,
    },
    {}>{

    mapViewRef: MapView | null = null;
    markerRef: Marker | null  = null;

    componentDidUpdate(prevProps: any){
        if(!_isEqual(prevProps.markers, this.props.markers)){
            if(this.props.markers && this.props.markers.length === 1){
                this.markerRef?.hideCallout();
                this.markerRef?.showCallout();
            } else if(this.props.refreshCallout){
                if(Platform.OS === 'ios'){
                    this.markerRef?.redrawCallout();
                } else {
                    this.markerRef?.hideCallout();
                    this.markerRef?.showCallout();
                }
            }
        }
    }

    onPressMarker(event: MapEvent<{}>, marker: placeMarkerData){
        event.preventDefault();
        this.props.onMarkerSelect(marker);
    }

    onPoiClick(event: MapEvent<{ placeId: string; name: string }>){
        if(this.markerRef) this.markerRef.hideCallout();
        this.props.onPoiSelect(event.nativeEvent.placeId);
    }

    onRegionChange(region: Region){
        this.props.onRegionChange(region, this.markerRef);
    }

    onMapPress(event: MapEvent<{}>){
        this.props.onPress();
    }

    onPressCallout(event: MapEvent<{}>, data: placeMarkerData){
        this.props.onShowDetails(data);
    }

    setMapViewRef(ref: MapView | null){
        this.mapViewRef = ref;
        this.props.setMapRef(ref);
    }

    handlePressCurrentLocation(){
        this.props.onPressCurrentLocation();
    }

    handlePressListView(){
        this.props.onPressListView();
    }

    handlePressLoadNearby(){
        if(this.markerRef) this.markerRef.hideCallout();
        this.props.onPressLoadNearby();
    }

    render() {
        return (
            <View style={{flex: 1}}>
            <MapView
                ref={ref => this.setMapViewRef(ref)}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                initialRegion={this.props.region}
                onRegionChangeComplete={this.onRegionChange.bind(this)} 
                showsMyLocationButton={false}
                showsUserLocation
                zoomTapEnabled={true}
                onPoiClick={this.onPoiClick.bind(this)}
                onPress={this.onMapPress.bind(this)}
                // customMapStyle={mapJson}
            >
                {this.props.markers.map((marker: placeMarkerData, idx: number) => (
                    <Marker
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
                                <View style={styles.bubbleHeader}>
                                    <Text style={styles.title}>{marker.title}</Text>
                                    <ReviewDollars 
                                        rating={marker.pricing || 0} 
                                        fontSize={16} 
                                        style={{ alignSelf: 'center' }}/>
                                </View>
                                <StarRatingListItem 
                                    noBullCount={marker.reviewCount}
                                    noBullRating={marker.rating}
                                    googleRating={marker.googleRating}
                                    googleCount={marker.googleCount}
                                    yelpRating={marker.yelpRating}
                                    yelpCount={marker.yelpCount} />
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
            <MapToolbar 
                loadingLocation={this.props.loadingLocation}
                loadingNearby={this.props.loadingNearby}
                showListViewButton={this.props.markers.length > 1}
                onPressCurrentLocation={this.handlePressCurrentLocation.bind(this)}
                onPressListView={this.handlePressListView.bind(this)}
                onPressLoadNearby={this.handlePressLoadNearby.bind(this)}
            />
            </View>
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
        width: 182
    },
    bubbleHeader: {
        flexDirection: 'row', 
        justifyContent: 'space-evenly',
        marginBottom: 5
    },
    title: {
        width: '80%',
        paddingRight: 4,
        textAlign: 'center',
        fontFamily: theme.fontBold,
        fontSize: 12,
        color: theme.DARK_COLOR
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
        marginTop: 10,
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
    },
    mapToolButtonContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(169,169,169, 0.7)'  
    },
    mapButton: {
        height: 60,
        width: 60,
        backgroundColor: theme.LIGHT_COLOR,
        borderRadius: 60,
        margin: 5,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    buttonIcon:{
        padding: 2,
        color: theme.DARK_COLOR,
        fontSize: 20
    },
    buttonText: {
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.DARK_COLOR,
        fontSize: 8
    }
});