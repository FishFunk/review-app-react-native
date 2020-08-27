import React, { Component } from "react";
import { Searchbar } from "react-native-paper";
import { StyleSheet } from "react-native";
import * as Device from 'expo-device';

export default class Search extends Component {

    state = {
        value: ''
    }

    getPlatform(){
        switch(Device.osName){
            case("iOS"):
                return "ios"
            case("Android"):
                return "android"
            default:
                return "default"
        }
    }

    onChangeSearch(query: string){
        this.setState({value: query});
    }

    render() {
        return (
            <Searchbar
              placeholder="Find a place"
              onChangeText={this.onChangeSearch.bind(this)}
              value={this.state.value}
            />
          );
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: 'white',
        padding: 0,
        margin: 0,
        borderRadius: 0
    },
    inputStyle: {
        borderColor: 'black',
        backgroundColor: 'white',
        padding: 5,
        margin: 0
    }
});