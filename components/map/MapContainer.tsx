import React from 'react';
import { View, Keyboard } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { get } from 'lodash';
import { searchPlace, marker, dbPlace } from '../../models/place';
import MapPlaceSummaryModal from './MapPlaceSummaryModal';
import { getGooglePlaceIdBySearch, getGooglePlaceById } from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import { Region, Marker } from 'react-native-maps';
import { Spinner } from 'native-base';
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
        searchNearby: boolean,
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
        searchNearby: true,
        apiKey: ''
    };

    componentDidMount(){
        this.load()
            .then((newState)=>{
                this.setState({ ...newState, loading: false });
            })
            .catch(error=>{
                FirebaseService.logError(error);
            });
    }

    async loadNearbyPlaceMarkers(lat: number, lng: number){
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
            newState.searchNearby = true;
        }
        
        newState.apiKey = googleApiKey;
        return newState;
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

        const placeId = await getGooglePlaceIdBySearch(this.state.apiKey, place.result.name);
        const dbPlace = await FirebaseService.getPlace(placeId.place_id);

        const marker: marker = {
            latlng: loc,
            title: place.result.name,
            rating: dbPlace ? dbPlace.rating : undefined
        }

        const reloadNearby = !isInRadius(
            this.state.region.latitude, 
            this.state.region.longitude,
            loc.latitude,
            loc.longitude,
            50);

        this.updateRegion(loc, reloadNearby);
        this.setState({ markers: [marker] });
    }

    onHandleRegionChange(region: Region, marker: Marker ){
        if(this.state.searchNearby){
            this.setState({ region: region, searchNearby: false }, ()=>{
                this.loadNearbyPlaceMarkers(region.latitude, region.longitude);
            });
        } else {
            const hideCallout = !isInRadius(
                this.state.region.latitude, 
                this.state.region.longitude,
                region.latitude,
                region.longitude,
                50);

            if(hideCallout) marker?.hideCallout();
            this.setState({ region });
        }
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

        this.setState({ placeId: placeId });
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
        
        let marker: marker;
        const { geometry, name } = await getGooglePlaceById(this.state.apiKey, placeId, ['geometry', 'name']);

        if(geometry && name){
            marker = {
                latlng: { latitude: geometry?.location.lat, longitude: geometry?.location.lng },
                title: name,
                rating: undefined
            }
            
            this.updateRegion(marker.latlng, false);
            this.setState({ markers: [marker] });
        }
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