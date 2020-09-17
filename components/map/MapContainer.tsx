import React from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { get } from 'lodash';
import { searchPlace, marker, dbPlace } from '../../models/place';
import MapPlaceSummaryModal from './MapPlaceSummaryModal';
import { getGooglePlaceIdBySearch, getGooglePlaceById } from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import { Region, Marker } from 'react-native-maps';
import { Spinner, Button, Text, Icon, Label } from 'native-base';
import theme from '../../styles/theme';
import { isInRadius } from '../../services/utils';

export default class MapContainer extends React.Component<
    {}, 
    {
        loading: boolean, 
        region: Region, 
        markers: marker[], 
        showSummaryModal: boolean,
        placeId: string,
        apiKey: string
    }> {


    defaultRegion = {
        // San Diego
        latitude: 32.7157,
        longitude: -117.1611,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09
    };

    // initial state
    state = {
        placeId: '',
        loading: true,
        region: this.defaultRegion,
        markers: [],
        showSummaryModal: false,
        apiKey: ''
    };

    componentDidMount(){
        this.load()
            .then((newState)=>{
                this.setState({ ...newState, loading: false }, ()=>{
                    this.loadNearbyPlaceMarkers();
                });
            })
            .catch(error=>{
                FirebaseService.logError(error);
            });
    }

    async loadNearbyPlaceMarkers(){
        const { latitude: lat, longitude: lng } = this.state.region;
        const places = await FirebaseService.getNearbyPlaces(lat, lng);
        const markers = this.convertPlacesToMarkers(places);
        this.setState({ markers: markers });
    }

    async load(){
        let newState: any = {};
        const googleApiKey = await FirebaseService.getKey('GOOGLE_API_KEY');
        await FirebaseService.registerPushNotificationToken();
        
        const data = await getLocation();
        if(data){
            newState.region = {
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            };
            newState.region.latitude = data.coords.latitude;
            newState.region.longitude = data.coords.longitude;
        }
        
        newState.apiKey = googleApiKey;
        return newState;
    }

    async goToMyLocation(){
        const data = await getLocation();
        if(data){
            let region = {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            };
            
            this.updateRegion(region);
        }
    }

    convertPlacesToMarkers(places: dbPlace[]){
        return places.map((place)=>{
            var m: marker = {
                latlng: {
                    latitude: place.lat,
                    longitude: place.lng
                },
                title: place.name,
                rating: place.rating
            }
            return m;
        });
    }

    updateRegion(data: any){
        this.setState({ region:  { ...data }} );
    }

    async handleSelectPlace(place: searchPlace){
        const loc = {
            latitude: get(place, 'result.geometry.location.lat'),
            longitude: get(place, 'result.geometry.location.lng'),
            latitudeDelta: 0.09,
            longitudeDelta: 0.09
        };

        const { place_id } = await getGooglePlaceIdBySearch(this.state.apiKey, place.result.name);
        const dbPlace = await FirebaseService.getPlace(place_id);

        const marker: marker = {
            latlng: loc,
            title: place.result.name,
            rating: dbPlace ? dbPlace.rating : undefined
        }

        this.updateRegion(loc);
        this.setState({ markers: [marker], placeId: place_id });
    }

    onHandleRegionChange(region: Region, marker: Marker ){
        const hideCallout = !isInRadius(
            this.state.region.latitude, 
            this.state.region.longitude,
            region.latitude,
            region.longitude,
            50);

        if(hideCallout) marker?.hideCallout();
        this.updateRegion(region);
    }

    async onMarkerSelect(mapClickEvent: any){
        let placeId;
        if(!mapClickEvent.placeId){
            const query = mapClickEvent.name || mapClickEvent.id;
            const result = await getGooglePlaceIdBySearch(this.state.apiKey, query).catch(error => {
                return Promise.reject(error);
            });
            placeId = result.place_id;
        } else {
            placeId = mapClickEvent.placeId;
        }

        const apiPlace = await getGooglePlaceById(this.state.apiKey, placeId, ['geometry']);
        const region = { 
            latitude: apiPlace.geometry?.location.lat, 
            longitude: apiPlace.geometry?.location.lng,
            latitudeDelta: this.state.region.latitudeDelta,
            longitudeDelta: this.state.region.longitudeDelta
        };

        this.setState({ placeId: placeId, region: { ...region } });
    }

    async onPoiSelect(mapClickEvent: any){
        let placeId: string;
        if(!mapClickEvent.placeId){
            const query = mapClickEvent.name || mapClickEvent.id;
            const result = await getGooglePlaceIdBySearch(this.state.apiKey, query).catch(error => {
                return Promise.reject(error);
            });
            placeId = result.place_id;
        } else {
            placeId = mapClickEvent.placeId;
        }

        this.loadSingleMarker(placeId);
    }

    async loadSingleMarker(placeId: string){
        let marker: marker;
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
                rating: dbPlace ? dbPlace.rating : undefined
            }

            let region = {
                latitude: marker.latlng.latitude,
                longitude: marker.latlng.longitude,
                latitudeDelta: this.state.region.latitudeDelta,
                longitudeDelta: this.state.region.longitudeDelta
            }
            
            this.updateRegion(region);
            this.setState({ markers: [marker], placeId: placeId });
        }
    }

    reloadPlaceReviews(){
        // Reload marker
        const { placeId } = this.state;
        this.loadSingleMarker(placeId);
    }

    onPressMapArea(){
        Keyboard.dismiss();
        this.setState({ showSummaryModal: false });
    }

    async onShowDetails(event: any){
        let placeId: string;
        if(event.id){
            const query = event.id;
            const result = await getGooglePlaceIdBySearch(this.state.apiKey, query).catch(error => {
                return Promise.reject(error);
            });
            placeId = result.place_id;

            this.setState({ placeId: placeId, showSummaryModal: true });
        }
    }

    onToggleSummaryModal(forceVal?: boolean){
        this.reloadPlaceReviews();
        if(forceVal != null){
            this.setState({ showSummaryModal: forceVal });
        } else {
            this.setState({ showSummaryModal: !this.state.showSummaryModal });
        }
    }

    render() {
        if(this.state.loading){
            return <Spinner color={theme.PRIMARY_COLOR}/>
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
                                region={this.state.region}
                                markers={this.state.markers}
                                onPress={this.onPressMapArea.bind(this)}
                                onMarkerSelect={this.onMarkerSelect.bind(this)}
                                onPoiSelect={this.onPoiSelect.bind(this)}
                                onRegionChange={this.onHandleRegionChange.bind(this)}
                                onShowDetails={this.onShowDetails.bind(this)}
                            />
                            <View
                                style={styles.buttonContainer}
                            >
                                <Button 
                                    style={styles.mapButton} 
                                    onPress={this.goToMyLocation.bind(this)}>
                                    <Icon 
                                        type={'FontAwesome5'} 
                                        name={'location-arrow'}
                                        style={styles.buttonIcon}></Icon>
                                    <Label style={styles.buttonText}>Location</Label>
                                </Button>
                                <Button 
                                    style={styles.mapButton} 
                                    onPress={this.loadNearbyPlaceMarkers.bind(this)}>
                                    <Icon 
                                        type={'FontAwesome5'} 
                                        name={'map-marked-alt'}
                                        style={styles.buttonIcon}></Icon>
                                    <Label style={styles.buttonText}>Nearby</Label>
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
    buttonContainer: {
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
        color: theme.DARK_COLOR,
        fontSize: 20
    },
    buttonText: {
        color: theme.DARK_COLOR,
        fontSize: 8
    }
})