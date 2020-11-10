import React from 'react';
import { View, Keyboard, StyleSheet, Dimensions } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { get } from 'lodash';
import { searchPlace, markerData, dbPlace } from '../../models/place';
import PlaceListModal from './PlaceListModal';
import { 
    getGooglePlaceIdBySearch, 
    getGooglePlaceById
} from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import MapView, { Region, Marker } from 'react-native-maps';
import { Spinner, Button, Icon, Label, Toast } from 'native-base';
import theme from '../../styles/theme';
import { isInRadius, getPlaceAvgRating } from '../../services/utils';
import SpinnerContainer from '../SpinnerContainer';

export default class MapContainer extends React.Component<
    {
        navigation: any
    }, 
    {
        loadingMap: boolean,
        loadingLocation: boolean,
        loadingNearby: boolean,
        region: Region, 
        zoomLevel: number,
        markers: markerData[], 
        places: dbPlace[],
        showListModal: boolean,
        reshowListModal: boolean,
        placeId: string,
        apiKey: string,
        refreshCallout: boolean,
        listOrderedBy: string
    }> {


    defaultRegion = {
        // San Diego
        latitude: 32.7157,
        longitude: -117.1611,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09
    };

    mapViewRef: MapView | null = null;
    unsubscribe1: any;
    unsubscribe2: any;

    // initial state
    state = {
        placeId: '',
        loadingMap: true,
        loadingLocation: false,
        loadingNearby: false,
        region: this.defaultRegion,
        zoomLevel: 14,
        markers: [],
        places: [],
        showListModal: false,
        reshowListModal: false,
        apiKey: '',
        refreshCallout: false,
        listOrderedBy: ''
    };
    
    componentDidMount(){
        this.unsubscribe1 = this.props.navigation.addListener('blur', () => {
            this.setState({ showListModal: false, reshowListModal: this.state.showListModal });
        });

        this.unsubscribe2 = this.props.navigation.addListener('focus', () => {
            this.onFocus();
        });

        this.load()
            .then((newState)=>{
                this.setState({ ...newState, loadingMap: false }, ()=>{
                    this.loadNearbyPlaceMarkers(5);
                });
            })
            .catch(error=>{
                FirebaseService.logError(JSON.stringify(error));
            });
    }

    componentWillUnmount(){
        this.unsubscribe1();
        this.unsubscribe2();
    }

    setMapRef(ref: MapView | null){
        this.mapViewRef = ref;
    }

    async loadNearbyPlaceMarkers(radius?: number){
        this.setState({ loadingNearby: true });

        const { latitude: lat, longitude: lng } = this.state.region;

        if(!radius){
            const { zoomLevel } = this.state;
            if(zoomLevel >= 15){
                radius = 5;
            } else if (zoomLevel >= 14){
                radius = 10;
            } else if (zoomLevel >= 13){
                radius = 15
            } else {
                radius = 25
            }
        }

        const places = await FirebaseService.getNearbyPlaces(lat, lng, radius);

        if(!places || places.length === 0){
            Toast.show({
                text: 'No reviews found in this area within your network. Try following more reviewers in the social tab!',
                position: 'bottom'
            });
            return this.setState({ loadingNearby: false });
        }

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

        this.setState({ markers: markers, loadingNearby: false, places: places  });
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
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
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
                rating: getPlaceAvgRating(place),
                placeId: place.id,
                icon: place.icon
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

        const rating = getPlaceAvgRating(dbPlace);

        const marker: markerData = {
            latlng: region,
            title: place.result.name,
            rating: rating,
            placeId: place_id
        }

        this.setState({ markers: [marker], placeId: place_id, places: [] });

        this.mapViewRef?.animateToRegion(region);
    }

    onHandleRegionChange(region: Region, marker: Marker | null){
        if(marker){
            const hideCallout = !isInRadius(
                this.state.region.latitude, 
                this.state.region.longitude,
                region.latitude,
                region.longitude,
                50);

            if(hideCallout) marker.hideCallout();
        }

        // Calculate map zoom level
        const zoom = Math.log2(360 * ((Dimensions.get('screen').width /256) / region.longitudeDelta)) + 1;

        this.setState({ region:  { ...region }, zoomLevel: zoom  });
    }

    async onMarkerSelect(marker: markerData){
        Keyboard.dismiss();
        const region = { 
            latitude: marker.latlng.latitude, 
            longitude: marker.latlng.longitude,
            latitudeDelta: this.state.region.latitudeDelta,
            longitudeDelta: this.state.region.longitudeDelta
        };

        this.setState({ placeId: marker.placeId });

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
                rating: getPlaceAvgRating(dbPlace),
                placeId: placeId
            }

            let region = {
                latitude: marker.latlng.latitude,
                longitude: marker.latlng.longitude,
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta
            }
            
            this.setState({ markers: [marker], placeId: placeId, places: [] });

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
        this.props.navigation.navigate(
            'PlaceDetails', { apiKey: this.state.apiKey, placeId: placeId });
    }

    showListModal(){
        this.setState({ showListModal: true });
    }

    onFocus(){
        this.reloadPlaceReviews();
        this.setState({ refreshCallout: false, showListModal: this.state.reshowListModal });
    }

    onDismissListModal(){
        this.setState({ showListModal: false });
    }

    onUpdateListOrder(orderBy: string){
        this.setState({ listOrderedBy: orderBy });
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
                                    onPress={()=>this.loadNearbyPlaceMarkers()}>
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
                                {
                                    this.state.places.length > 1 ?
                                    <Button 
                                        style={styles.mapButton} 
                                        onPress={this.showListModal.bind(this)}>
                                        <View>
                                            <Icon 
                                                type={'FontAwesome5'} 
                                                name={'list'}
                                                style={styles.buttonIcon}>
                                            </Icon>
                                            <Label style={styles.buttonText}>List View</Label>
                                        </View>
                                    </Button> : null
                                }
                            </View>
                        </View> : null
                }

                <PlaceListModal 
                    apiKey={this.state.apiKey}
                    isOpen={this.state.showListModal}
                    places={this.state.places}
                    onDismissModal={this.onDismissListModal.bind(this)}
                    onShowPlaceDetails={this.onShowDetails.bind(this)}
                    onUpdateSortOrder={this.onUpdateListOrder.bind(this)}
                    orderBy={this.state.listOrderedBy}/>
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