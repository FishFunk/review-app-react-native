import React from 'react';
import { View } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../services/locationService';
import { get } from 'lodash';
import { LocationData } from 'expo-location';

export default class MapContainer extends React.Component {

    initialState = {
        // San Francisco
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    state = {
        region: this.initialState
    };

    componentDidMount(){
        this.getInitialState();
    }

    getInitialState(){
        getLocation()
            .then((data: LocationData)=>{
                this.updateRegion({
                    latitude: data.coords.latitude,
                    longitude: data.coords.longitude
                });
            })
            .catch(error =>{
                console.error(error);
            });
    }

    updateRegion(loc: any){
        this.setState({
            region: {
                latitude: loc.latitude,
                longitude: loc.longitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003
            }
        });
    }

    handleSelectPlace(place: any){
        console.log(place);
        const loc = {
            latitude: get(place, 'result.geometry.location.lat'),
            longitude: get(place, 'result.geometry.location.lng')
        };
        this.updateRegion(loc);
    }

    onHandleRegionChange(region: any){
        this.setState({ region });
    }

    render() {
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
                                onRegionChange={this.onHandleRegionChange.bind(this)}
                            />
                        </View> : null
                }
            </View>
        )
    }
}