import React from 'react';
import { View, Keyboard, StyleSheet, Dimensions } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../../services/locationService';
import { searchPlace, placeMarkerData, dbPlace } from '../../models/place';
import PlaceListModal from './PlaceListModal';
import { getGooglePlaceIdBySearch } from '../../services/googlePlaceApiService';
import FirebaseService from '../../services/firebaseService';
import MapView, { Region, Marker } from 'react-native-maps';
import { Spinner, Toast } from 'native-base';
import Utils from '../../services/utils';
import SpinnerContainer from '../SpinnerContainer';
import { getApiPlaceSummary } from '../../services/combinedApiService';

export default class MapContainer extends React.Component<
    {
        navigation: any,
        route: any
    }, 
    {
        loadingMap: boolean,
        loadingLocation: boolean,
        loadingNearby: boolean,
        loadingSingleMarker: boolean,
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
        loadingSingleMarker: false,
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
            console.log("setting reload markers to TRUE");
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
                radius = 6;
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
                text: "Darn... we couldn't any reviews by the people you follow in this area. Try zooming out and searching again or find more reviewers to follow in the social tab!",
                position: 'bottom',
                duration: 10000,
                buttonText: 'OK'
            });
            return this.setState({ loadingNearby: false, markers: [] });
        }

        const markers = await this.convertPlacesToMarkers(places);

        if(this.mapViewRef){
            const latLngs = markers.map(m=>m.latlng);

            // include current region within scope
            latLngs.push({ 
                latitude: lat, 
                longitude: lng });

            this.mapViewRef.fitToCoordinates(latLngs, 
                { animated: true, 
                    edgePadding: {top: 100, right: 80, bottom: 80, left: 80 }});
        }

        this.setState({ markers: markers, loadingNearby: false, hideCallout: true  });
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
        const { place_id } = await getGooglePlaceIdBySearch(this.state.apiKey, place.result.name);
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
        
        this.setState({ refreshCallout: false, loadingSingleMarker: true });

        try{
            const dbPlace = await FirebaseService.getPlace(placeId);
            const placeSummary = await getApiPlaceSummary(this.state.apiKey, placeId);
    
            if(placeSummary){
                placeSummary.reviewCount = dbPlace ? Object.keys(dbPlace.reviews).length : 0;
                placeSummary.rating = Utils.getPlaceAvgRating(dbPlace);
                placeSummary.pricing = Utils.getPlaceAvgPricing(dbPlace);
    
                let region = {
                    latitude: placeSummary.latlng.latitude,
                    longitude: placeSummary.latlng.longitude,
                    latitudeDelta: this.state.region.latitudeDelta,
                    longitudeDelta: this.state.region.longitudeDelta
                }
                
                this.setState({ markers: [placeSummary], placeId: placeId, refreshCallout: true });
        
                this.mapViewRef?.animateToRegion(region);
            }
        } catch (ex){
            FirebaseService.logError(ex, 'MapContainer - loadSingleMarker');
        }

        this.setState({ loadingSingleMarker: false });
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

    render() {
        if(this.state.loadingMap){
            return <SpinnerContainer />
        }
        return (
            <View style={styles.flex}>
                <View style={styles.mapInput}>
                    <MapInput 
                        handleSelectPlace={this.handleSelectPlace.bind(this)}
                        apiKey={this.state.apiKey} />
                    {
                        this.state.loadingSingleMarker ? 
                            <SpinnerContainer transparent={true} /> : null
                    }
                </View>
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
                    orderBy={this.state.listOrderedBy}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    mapInput: {
        zIndex: 9999, 
        marginLeft: 10, 
        marginRight: 10
    }
});