import React from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { get } from 'lodash';
import { searchPlace, markerData, dbPlace } from '../../models/place';
import MapPlaceSummaryModal from './MapPlaceSummaryModal';
import { 
    getGooglePlaceIdBySearch, 
    getGooglePlaceById
} from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import MapView, { Region, Marker } from 'react-native-maps';
import { Spinner, Button, Icon, Label } from 'native-base';
import theme from '../../styles/theme';
import { isInRadius, getPlaceAvgRating } from '../../services/utils';
import SpinnerContainer from '../SpinnerContainer';

export default class MapContainer extends React.Component<
    {}, 
    {
        loadingMap: boolean,
        loadingLocation: boolean,
        loadingNearby: boolean,
        region: Region, 
        markers: markerData[], 
        showSummaryModal: boolean,
        placeId: string,
        apiKey: string,
        refreshCallout: boolean
    }> {


    defaultRegion = {
        // San Diego
        latitude: 32.7157,
        longitude: -117.1611,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09
    };

    mapViewRef: MapView | null = null;

    // initial state
    state = {
        placeId: '',
        loadingMap: true,
        loadingLocation: false,
        loadingNearby: false,
        region: this.defaultRegion,
        markers: [],
        showSummaryModal: false,
        apiKey: '',
        refreshCallout: false
    };

    componentDidMount(){
        this.load()
            .then((newState)=>{
                this.setState({ ...newState, loadingMap: false }, ()=>{
                    this.loadNearbyPlaceMarkers(10);
                });
            })
            .catch(error=>{
                FirebaseService.logError(JSON.stringify(error));
            });
    }

    setMapRef(ref: MapView | null){
        this.mapViewRef = ref;
    }

    async loadNearbyPlaceMarkers(radius?: number){
        this.setState({ loadingNearby: true });

        const { latitude: lat, longitude: lng } = this.state.region;
        const places = await FirebaseService.getNearbyPlaces(lat, lng, radius);
        const markers = this.convertPlacesToMarkers(places);

        if(this.mapViewRef){
            const latLngs = markers.map(m=>m.latlng);

            // include current region within scope
            latLngs.push({ 
                latitude: lat, 
                longitude: lng });

            this.mapViewRef.fitToCoordinates(latLngs, 
                { animated: true, 
                    edgePadding: {top: 80, right: 80, bottom: 80, left: 80 }});
        }

        this.setState({ markers: markers, loadingNearby: false });
    }

    async load(){
        let newState: any = {};
        const googleApiKey = await FirebaseService.getMetadata('GOOGLE_API_KEY');
        await FirebaseService.registerPushNotificationToken();
        
        const data = await getLocation();
        if(data){
            newState.region = {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            };
        }
        
        newState.apiKey = googleApiKey;
        return newState;
    }

    async goToMyLocation(){
        this.setState({ loadingLocation: true });
        const data = await getLocation();
        if(data){
            let region = {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            };
            
            this.mapViewRef?.animateToRegion(region);
        }
        this.setState({ loadingLocation: false });
    }

    convertPlacesToMarkers(places: dbPlace[]){
        return places.map((place)=>{
            var m: markerData = {
                latlng: {
                    latitude: place.lat,
                    longitude: place.lng
                },
                title: place.name,
                rating: place.rating,
                placeId: place.id
            }
            return m;
        });
    }

    async handleSelectPlace(place: searchPlace){
        Keyboard.dismiss();
        const region = {
            latitude: get(place, 'result.geometry.location.lat'),
            longitude: get(place, 'result.geometry.location.lng'),
            latitudeDelta: 0.09,
            longitudeDelta: 0.09
        };

        const { place_id } = await getGooglePlaceIdBySearch(this.state.apiKey, place.result.name);
        const dbPlace = await FirebaseService.getPlace(place_id);
        const reviews = await FirebaseService.getFilteredPlaceReviews(place_id);

        const rating = getPlaceAvgRating(dbPlace, reviews);

        const marker: markerData = {
            latlng: region,
            title: place.result.name,
            rating: rating,
            placeId: place_id
        }

        this.setState({ markers: [marker], placeId: place_id });

        this.mapViewRef?.animateToRegion(region);
    }

    onHandleRegionChange(region: Region, marker: Marker | null){
        if(marker){
            const hideCallout = !isInRadius(
                this.state.region.latitude, 
                this.state.region.longitude,
                region.latitude,
                region.longitude,
                10);

            if(hideCallout) marker.hideCallout();
        }

        this.setState({ region:  { ...region } });
    }

    async onMarkerSelect(marker: markerData){
        Keyboard.dismiss();
        const region = { 
            latitude: marker.latlng.latitude, 
            longitude: marker.latlng.longitude,
            latitudeDelta: this.state.region.latitudeDelta,
            longitudeDelta: this.state.region.longitudeDelta
        };

        this.setState({placeId: marker.placeId});

        this.mapViewRef?.animateToRegion(region);
    }

    async loadSingleMarker(placeId: string){
        let marker: markerData;
        let geometry, name;
        const dbPlace = await FirebaseService.getPlace(placeId);

        if(!dbPlace){
            const apiPlace = await getGooglePlaceById(this.state.apiKey, placeId, ['geometry', 'name']);
            geometry = apiPlace.geometry;
            name = apiPlace.name;
        } else {
            geometry = { location: { lat: dbPlace.lat, lng: dbPlace.lng }};
            name = dbPlace.name;
        }
        
        if(geometry && name){
            marker = {
                latlng: { latitude: geometry?.location.lat, longitude: geometry?.location.lng },
                title: name,
                rating: dbPlace ? dbPlace.rating : undefined,
                placeId: placeId
            }

            let region = {
                latitude: marker.latlng.latitude,
                longitude: marker.latlng.longitude,
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta
            }
            
            this.setState({ markers: [marker], placeId: placeId });

            this.mapViewRef?.animateToRegion(region);
        }
    }

    reloadPlaceReviews(){
        // Reload single marker
        const { placeId, markers } = this.state;

        this.setState({refreshCallout: true});

        if(markers.length === 1){
            this.loadSingleMarker(placeId);      
        }
    }

    onPressMapArea(){
        Keyboard.dismiss();
    }

    async onShowDetails(placeId: string){
        if(placeId){
            this.setState({ placeId: placeId, showSummaryModal: true });
        }
    }

    onToggleSummaryModal(forceVal?: boolean){
        this.reloadPlaceReviews();
        if(forceVal != null){
            this.setState({ showSummaryModal: forceVal, refreshCallout: false });
        } else {
            this.setState({ showSummaryModal: !this.state.showSummaryModal, refreshCallout: false });
        }
    }

    render() {
        if(this.state.loadingMap){
            return <SpinnerContainer />
        }

        return (
            <View style={{ width: '100%', height: '100%' }}>
                <View style={{zIndex: 9999, marginLeft: 10, marginRight: 10}}>
                    <MapInput 
                        handleSelectPlace={this.handleSelectPlace.bind(this)}
                        apiKey={this.state.apiKey} />
                </View>
                {
                    this.state.region.latitude ?
                        <View style={{width: '100%', height: '100%'}}>
                            <Map 
                                setMapRef={this.setMapRef.bind(this)}
                                refreshCallout={this.state.refreshCallout}
                                region={this.state.region}
                                markers={this.state.markers}
                                onPress={this.onPressMapArea.bind(this)}
                                onMarkerSelect={this.onMarkerSelect.bind(this)}
                                onPoiSelect={this.loadSingleMarker.bind(this)}
                                onRegionChange={this.onHandleRegionChange.bind(this)}
                                onShowDetails={this.onShowDetails.bind(this)}
                            />
                            <View
                                style={styles.mapToolButtonContainer}
                            >
                                <Button 
                                    style={styles.mapButton} 
                                    onPress={this.goToMyLocation.bind(this)}>
                                    {
                                        this.state.loadingLocation ?
                                        <Spinner 
                                            style={{marginTop: 2, marginLeft: 2}} 
                                            color={theme.DARK_COLOR}/> : 
                                        <View>
                                            <Icon 
                                                type={'FontAwesome5'} 
                                                name={'location-arrow'}
                                                style={styles.buttonIcon}>
                                            </Icon>
                                            <Label style={styles.buttonText}>Current Location</Label>
                                        </View>
                                    }
                                </Button>
                                <Button 
                                    style={styles.mapButton} 
                                    onPress={this.loadNearbyPlaceMarkers.bind(this, 15)}>
                                    {
                                        this.state.loadingNearby ?
                                        <Spinner 
                                            style={{marginTop: 2, marginLeft: 2}} 
                                            color={theme.DARK_COLOR}/> : 
                                        <View>
                                            <Icon 
                                                type={'FontAwesome5'} 
                                                name={'map-marked-alt'}
                                                style={styles.buttonIcon}>
                                            </Icon>
                                            <Label style={styles.buttonText}>Nearby Reviews</Label>
                                        </View>
                                    }
                                </Button>
                            </View>
                        </View> : null
                }
                <MapPlaceSummaryModal 
                    apiKey={this.state.apiKey}
                    isOpen={this.state.showSummaryModal} 
                    placeId={this.state.placeId} 
                    toggleSummaryModal={this.onToggleSummaryModal.bind(this)}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
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
})