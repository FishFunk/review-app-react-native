import React from 'react';
import { View, Keyboard, StyleSheet, Dimensions } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { searchPlace, placeMarkerData, dbPlace } from '../../models/place';
import PlaceListModal from './PlaceListModal';
import { getGooglePlaceById, getSingleGooglePlaceIdBySearch } from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import MapView, { Region, Marker } from 'react-native-maps';
import { Toast } from 'native-base';
import Utils from '../../services/utils';
import SpinnerContainer from '../SpinnerContainer';
import { 
    createPlaceMarkerObjectFromGooglePlace,
    getApiPlaceSummary, 
    getNearbyPlaceSummariesByQuery, 
    getNearbyPlaceSummariesByType, 
    loadMoreResults, 
    shouldShowLoadMoreOption } from '../../services/combinedApiService';
import MapQuickSearchButtons from './MapQuickSearchButtons';
import _indexOf from 'lodash/indexOf';
import { defaultGoogleApiFields } from '../../constants/Various';
export default class MapContainer extends React.Component<
    {
        navigation: any,
        route: any
    }, 
    {
        loadingMap: boolean,
        loadingLocation: boolean,
        loadingNearby: boolean,
        showGeneralLoadingSpinner: boolean,
        showLoadMoreOption: boolean,
        region: Region, 
        zoomLevel: number,
        markers: placeMarkerData[], 
        showListModal: boolean,
        reshowListModal: boolean,
        placeId: string,
        apiKey: string,
        refreshCallout: boolean,
        listOrderedBy: string,
        hideCallout: boolean
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
    _reloadCurrentMarkers: boolean = false;

    // initial state
    state = {
        placeId: '',
        loadingMap: true,
        loadingLocation: false,
        loadingNearby: false,
        showGeneralLoadingSpinner: false,
        showLoadMoreOption: false,
        region: this.defaultRegion,
        zoomLevel: 14,
        markers: [],
        showListModal: false,
        reshowListModal: false,
        apiKey: '',
        refreshCallout: false,
        listOrderedBy: '',
        hideCallout: false
    };
    
    componentDidMount(){
        this.unsubscribe1 = this.props.navigation.addListener('blur', () => {
            this.setState({ showListModal: false, reshowListModal: this.state.showListModal });
        });

        this.unsubscribe2 = this.props.navigation.addListener('focus', () => {
            this.onFocus();
        });

        FirebaseService.onUserFollowingUpdated(()=>{
            this._reloadCurrentMarkers = true;
        });

        this.load()
            .then((newState)=>{
                this.setState({ ...newState, loadingMap: false }, ()=>{
                    this.loadNearbyPlaceMarkers(10);
                });
            })
            .catch(error=>{
                FirebaseService.logError(JSON.stringify(error), 'MapContainer - componentDidMount');
            });
    }

    componentWillUnmount(){
        this.unsubscribe1();
        this.unsubscribe2();
        FirebaseService.offUserFollowingUpdated();
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
                radius = 10;
            } else if (zoomLevel >= 14){
                radius = 15;
            } else if (zoomLevel >= 13){
                radius = 25;
            } else if (zoomLevel >= 12) {
                radius = 100;
            } else if (zoomLevel >= 10) {
                radius = 250;
            } else {
                // radius remains undefined so any relevant places will be pulled no matter the range
            }
        }

        const places = await FirebaseService.getNearbyPlaces(lat, lng, radius);

        if(!places || places.length === 0){
            Toast.show({
                text: "Darn... we couldn't find any reviews by the people you follow in this area. Try zooming out and searching again or find more reviewers to follow in the social tab!",
                position: 'bottom',
                duration: 8000
            });
            return this.setState({ loadingNearby: false, markers: [] });
        }

        const markers = await this.convertPlacesToMarkers(places);

        this.fitMapToMarkers(markers);

        this.setState({ markers: markers, loadingNearby: false, hideCallout: true, showLoadMoreOption: false  });
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

    async convertPlacesToMarkers(places: dbPlace[]){
        let markers  = [];
        for(let place of places){
            let placeDetails = await getApiPlaceSummary(this.state.apiKey, place.id);
            if(placeDetails){
                placeDetails.reviewCount = place.reviews ? Object.keys(place.reviews).length : 0;
                placeDetails.rating = Utils.getPlaceAvgRating(place);    
                placeDetails.pricing = Utils.getPlaceAvgPricing(place);
                markers.push(placeDetails);
            }
           
        }

        return markers;
    }

    async handleSelectPlace(place: searchPlace){
        Keyboard.dismiss();

        let lat, lng;
        if(place.result.geometry){
            lat = place.result.geometry.location.lat;
            lng = place.result.geometry.location.lng;
        } else {
            lat = this.state.region.latitude;
            lng = this.state.region.longitude;
        }

        const { place_id } = await getSingleGooglePlaceIdBySearch(this.state.apiKey, place.result.name, lat, lng);
        this.loadSingleMarker(place_id);
    }

    onHandleRegionChange(region: Region, marker: Marker | null){
        if(marker && this.state.hideCallout){
            marker.hideCallout();
        }

        // Calculate map zoom level
        const zoom = Math.log2(360 * ((Dimensions.get('screen').width /256) / region.longitudeDelta)) + 1;
        this.setState({ region:  { ...region }, zoomLevel: zoom, hideCallout: false });
    }

    fitMapToMarkers(markers: placeMarkerData[]){
        if(this.mapViewRef && markers){
            const { latitude: lat, longitude: lng }  = this.state.region;
            const latLngs = markers.map(m=>m.latlng);

            // include current region within scope
            latLngs.push({ 
                latitude: lat, 
                longitude: lng });

            this.mapViewRef.fitToCoordinates(latLngs, 
                { animated: true, 
                    edgePadding: {top: 120, right: 80, bottom: 80, left: 80 }});
        }
    }

    async onMarkerSelect(marker: placeMarkerData){
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
        if(!placeId){
            return;
        }
        
        this.setState({ refreshCallout: false, showGeneralLoadingSpinner: true });

        try{
            const dbPlace = await FirebaseService.getPlace(placeId);
            const googleApiPlace = await getGooglePlaceById(this.state.apiKey, placeId, defaultGoogleApiFields);
    
            if(googleApiPlace){
                let region = {
                    latitude: googleApiPlace.geometry?.location.lat,
                    longitude: googleApiPlace.geometry?.location.lng,
                    latitudeDelta: this.state.region.latitudeDelta,
                    longitudeDelta: this.state.region.longitudeDelta
                };

                if(_indexOf(googleApiPlace.types, 'political') > -1 || 
                    _indexOf(googleApiPlace.types, 'locality') > -1){
                    // if target place is not relevant for reviews, just animate to region
                    this.setState({ showGeneralLoadingSpinner: false });
                } else {
                    // if target place IS relevant for reviews, load review data and create marker
                    const placeMarker = await createPlaceMarkerObjectFromGooglePlace(googleApiPlace);
                    placeMarker.reviewCount = dbPlace ? Object.keys(dbPlace.reviews).length : 0;
                    placeMarker.rating = Utils.getPlaceAvgRating(dbPlace);
                    placeMarker.pricing = Utils.getPlaceAvgPricing(dbPlace);
    
                    this.setState({ markers: [placeMarker], placeId: placeId, refreshCallout: true, showGeneralLoadingSpinner: false });
                }

                this.mapViewRef?.animateToRegion(region);
            }
        } catch (ex){
            this.setState({ showGeneralLoadingSpinner: false });
            FirebaseService.logError(ex, 'MapContainer - loadSingleMarker');
        }

    }

    onPressMapArea(){
        Keyboard.dismiss();
    }

    async onShowDetails(placeSummary: placeMarkerData){
        this.props.navigation.navigate(
            'PlaceDetails', { apiKey: this.state.apiKey, placeSummary: placeSummary });
    }

    showListModal(){
        this.setState({ showListModal: true });
    }

    async onFocus(){
        if(this._reloadCurrentMarkers){
            this._reloadCurrentMarkers = false;
            await this.loadNearbyPlaceMarkers();
        } else {
            const { placeId } = this.state;
            const { reloadMarkers } = this.props.route.params ? this.props.route.params : { reloadMarkers: false };
    
            // Route param passed from Place Details if review was written or edited
            if(placeId && reloadMarkers){
                await this.loadSingleMarker(placeId);
            }
    
            this.setState({ refreshCallout: false, showListModal: this.state.reshowListModal });
        }
    }

    onDismissListModal(){
        this.setState({ showListModal: false });
    }

    onUpdateListOrder(orderBy: string){
        this.setState({ listOrderedBy: orderBy });
    }

    async onQuickSearch(query: string){
        Keyboard.dismiss();
        
        this.setState({ showGeneralLoadingSpinner: true, hideCallout: true, showLoadMoreOption: true });
        let type: 'bar' | 'restaurant' | 'cafe' | 'meal_delivery' | 'meal_takeaway' | 'night_club';

        // if query is a quick search item convert to plain text
        switch(query){
            case('bar'):
                type = 'bar';
                break;    
            case('restaurant'):
                // query = resutaurant
                break;
            case('meal_delivery'):
                query = 'delivery';
                break;
            case('meal_takeaway'):
                query = 'takeout';
                break;
            case('cafe'):
                type = 'cafe';
                break;   
            default:
                // use generic query instead of pre-defined type search
        }

        let placeMarkers: placeMarkerData[] = [];

        try{
            const { apiKey } = this.state;
            const { latitude, longitude } = this.state.region;
            
            if(type){
                placeMarkers = await getNearbyPlaceSummariesByType(apiKey, latitude, longitude, type);
            } else {
                placeMarkers = await getNearbyPlaceSummariesByQuery(
                    apiKey, latitude, longitude, query);
            }

            for(let place of placeMarkers){
                const match = await FirebaseService.getPlace(place.placeId);
                if(match){
                    place.reviewCount = match.reviews ? Object.keys(match.reviews).length : 0;
                    place.rating = Utils.getPlaceAvgRating(match);    
                    place.pricing = Utils.getPlaceAvgPricing(match);
                }
            }
        } catch (ex){
            console.error(ex);
        }

        if(!placeMarkers || placeMarkers.length === 0){
            Toast.show({
                text: "Shoot! We didn't find any relevant places nearby. Try a different search!",
                position: 'bottom',
                duration: 8000
            });
        } else {
            this.fitMapToMarkers(placeMarkers)
        }

        this.setState({ markers: placeMarkers, showGeneralLoadingSpinner: false });
    }

    async onLoadMoreResults(){
        const currentPlaces = this.state.markers;
        this.setState({ showGeneralLoadingSpinner: true });
        const morePlaces = await loadMoreResults(this.state.apiKey);
        const allPlaces = currentPlaces.concat(morePlaces);
        const showLoadMoreOption = await shouldShowLoadMoreOption();
        
        this.setState({ 
            showLoadMoreOption: showLoadMoreOption,
            markers: allPlaces, 
            showGeneralLoadingSpinner: false });
    }

    render() {
        if(this.state.loadingMap){
            return <SpinnerContainer />
        }
        return (
            <View style={styles.flex}>
                <MapInput 
                    handleSelectPlace={this.handleSelectPlace.bind(this)}
                    handleGenericSearch={this.onQuickSearch.bind(this)}
                    apiKey={this.state.apiKey} />
                {
                    this.state.showGeneralLoadingSpinner ? 
                        <SpinnerContainer transparent={true} /> : null
                }
                {
                    this.state.zoomLevel >= 12 ?
                        <MapQuickSearchButtons onQuickSearch={this.onQuickSearch.bind(this)} /> : null
                }
                {
                    this.state.region.latitude ?
                        <View style={styles.flex}>
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

                                loadingLocation={this.state.loadingLocation}
                                loadingNearby={this.state.loadingNearby}
                                onPressLoadNearby={this.loadNearbyPlaceMarkers.bind(this)}
                                onPressListView={this.showListModal.bind(this)}
                                onPressCurrentLocation={this.goToMyLocation.bind(this)}
                            />
                        </View> : null
                }

                <PlaceListModal 
                    apiKey={this.state.apiKey}
                    isOpen={this.state.showListModal}
                    places={this.state.markers}
                    onDismissModal={this.onDismissListModal.bind(this)}
                    onShowPlaceDetails={this.onShowDetails.bind(this)}
                    onUpdateSortOrder={this.onUpdateListOrder.bind(this)}
                    onLoadMoreResults={this.onLoadMoreResults.bind(this)}
                    showLoadMoreOption={this.state.showLoadMoreOption}
                    orderBy={this.state.listOrderedBy}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    flex: {
        flex: 1
    }
});