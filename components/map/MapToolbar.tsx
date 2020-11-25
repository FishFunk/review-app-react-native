import React from 'react';
import theme from '../../styles/theme';
import { View, StyleSheet  } from 'react-native';
import { Button, Icon, Label, Spinner, Text } from 'native-base';

export default class MapToolbar extends React.Component<
    {
        loadingLocation: boolean,
        loadingNearby: boolean,
        showListViewButton: boolean,
        onPressCurrentLocation: ()=>any,
        onPressLoadNearby: ()=>any,
        onPressListView: ()=> any
    },
    {}>{

    render() {
        return (
            <View style={styles.mapToolButtonContainer}>
                <Button 
                    style={styles.mapButton} 
                    onPress={this.props.onPressLoadNearby}>
                    {
                        this.props.loadingNearby ?
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
                <Button 
                    style={styles.mapButton} 
                    onPress={this.props.onPressCurrentLocation}>
                    {
                        this.props.loadingLocation ?
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
                {
                    this.props.showListViewButton ?
                    <Button 
                        style={styles.mapButton} 
                        onPress={this.props.onPressListView}>
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
        fontSize: 8,
        width: 50
    }
});