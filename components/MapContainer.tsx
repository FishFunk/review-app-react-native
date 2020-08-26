import React from 'react';
import { View } from 'react-native';
import MapInput from './MapInput';
import Map from './Map';
import { getLocation } from '../services/locationService';

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
            .then((data: Coordinates)=>{
                this.updateState({
                    latitude: data.latitude,
                    longitude: data.longitude
                })
            })
            .catch(error =>{
                // console.error(error);
            });
    }

    getCoordsFromName(loc: any){
        console.log(loc);

        this.updateState({
            latitude: loc.lat,
            longitude: loc.lng
        })
    }

    updateState(loc: any){
        this.setState({
            latitude: loc.latitude,
            longitude: loc.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003
        })
    }

    // onNotifyChange(data: any, details: any){
    //     console.log(data);
    //     console.log(details);
    // }

    onMapRegionChange(region: any){
        this.setState({ region });
    }

    render() {
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <View style={{zIndex: 999, marginLeft: 10, marginRight: 10}}>
                    <MapInput notifyChange={this.getCoordsFromName}/>
                </View>
                {
                    this.state.region.latitude ?
                        <View style={{width: '100%', height: '100%'}}>
                            <Map 
                                region={this.state.region}
                                onRegionChange={this.onMapRegionChange.bind(this)}
                            />
                        </View> : null
                }
            </View>
        )
    }
}