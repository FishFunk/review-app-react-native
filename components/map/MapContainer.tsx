import React from 'react';
import { View, Keyboard, Dimensions } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { get } from 'lodash';
import { LocationData } from 'expo-location';
import { searchPlace, apiPlace, marker, dbPlace } from '../../models/place';
import MapPlaceSummaryModal from './MapPlaceSummaryModal';
import { getGooglePlaceIdBySearch } from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import { Region } from 'react-native-maps';

export default class MapContainer extends React.Component<
    {}, 
    {
        loading: boolean, 
        region: Region, 
        markers: marker[], 
        showSummaryModal: boolean,
        placeId: string,
        searchNearby: boolean
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
        searchNearby: true
    };

    styles = {
        container: {
          flex: 1,
          zIndex: 1,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center'
        },
        dragHandler: {
          alignSelf: 'stretch',
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ccc'
        }
    };

    componentDidMount(){
        this.getInitialState()
            .then(async ()=>{
                this.setState({ loading: false });
                FirebaseService.registerPushNotificationToken();
            });
    }

    async loadNearbyPlaceMarkers(lat: number, lng: number){
        const places = await FirebaseService.getNearbyPlaces(lat, lng);        
        const markers = this.convertPlacesToMarkers(places);
        this.setState({ markers: markers });
    }

    getInitialState(){
        return getLocation()
            .then((data: LocationData)=>{
                console.log("getLocation success: " + JSON.stringify(data));
                this.updateRegion({
                    latitude: data.coords.latitude,
                    longitude: data.coords.longitude,
                }, true);
            })
            .catch(error =>{
                console.log("getLocation failed. using default region");
                this.updateRegion(this.defaultRegion, true);
            });
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

    updateRegion(loc: any, searchNearby: boolean){
        this.setState({
            region: {
                latitude: loc.latitude,
                longitude: loc.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            },
            searchNearby: searchNearby
        });
    }

    async handleSelectPlace(place: searchPlace){
        const loc = {
            latitude: get(place, 'result.geometry.location.lat'),
            longitude: get(place, 'result.geometry.location.lng')
        };

        const placeId = await getGooglePlaceIdBySearch(place.result.name);
        const dbPlace = await FirebaseService.getPlace(placeId.place_id);

        const marker: marker = {
            latlng: loc,
            title: place.result.name,
            rating: dbPlace ? dbPlace.rating : undefined
        }

        this.updateRegion(loc, false);
        this.setState({ markers: [marker] });
    }

    onHandleRegionChange(region: any){
        if(this.state.searchNearby){
            this.setState({ region: region }, ()=>{
                this.loadNearbyPlaceMarkers(region.latitude, region.longitude);
            });
        } else {
            this.setState({ searchNearby: true });
        }

    }

    async onMarkerSelect(mapClickEvent: any){
        if(!mapClickEvent.placeId){
            const query = mapClickEvent.name || mapClickEvent.id;
            const place = await getGooglePlaceIdBySearch(query).catch(error => {
                return Promise.reject(error);
            });

            this.setState({ placeId: place.place_id, showSummaryModal: true });
        } else {
            this.setState({ placeId: mapClickEvent.placeId, showSummaryModal: true });
        }
    }

    onPressMapArea(){
        Keyboard.dismiss();
        this.setState({ showSummaryModal: false });
    }

    onToggleSummaryModal(forceVal?: boolean){
        if(forceVal != null){
            this.setState({ showSummaryModal: forceVal });
        } else {
            this.setState({ showSummaryModal: !this.state.showSummaryModal });
        }
    }

    render() {
        if(this.state.loading){
            // show loading
        }

        return (
            <View style={{ width: '100%', height: '100%' }}>
                <View style={{zIndex: 9999, marginLeft: 10, marginRight: 10}}>
                    <MapInput handleSelectPlace={this.handleSelectPlace.bind(this)}/>
                </View>
                {
                    this.state.region.latitude ?
                        <View style={{width: '100%', height: '100%'}}>
                            <Map 
                                region={this.state.region}
                                markers={this.state.markers}
                                onPress={this.onPressMapArea.bind(this)}
                                onMarkerSelect={this.onMarkerSelect.bind(this)}
                                onRegionChange={this.onHandleRegionChange.bind(this)}
                            />
                        </View> : null
                }

                <MapPlaceSummaryModal 
                    isOpen={this.state.showSummaryModal} 
                    placeId={this.state.placeId} 
                    toggleSummaryModal={this.onToggleSummaryModal.bind(this)}/>
            </View>
        )
    }
}