import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Icon, Label, View } from 'native-base';
import { StyleSheet, Linking } from 'react-native';
import { fullApiPlace } from '../models/place';
import openMap from 'react-native-open-maps';
import theme from '../styles/theme';

export default function HorizontalButtonList(
    props: {
        disableEdit: boolean,
        onPressWriteReview: ()=>any,
        place: fullApiPlace
    }){

    function onOpenMaps(){
        const { formatted_address, name } = props.place;
        
        openMap({ 
            // latitude: lat,
            // longitude: lng, 
            query: name, 
            end: formatted_address });
    }
    return (
        <View style={styles.buttonContainer}>
            <ScrollView 
                style={{alignSelf: 'center'}}
                horizontal 
                showsHorizontalScrollIndicator={false}>
                <Button small rounded transparent 
                    style={props.disableEdit ? styles.disabledButton : styles.roundButton} 
                    onPress={()=>props.onPressWriteReview()}
                    disabled={props.disableEdit}>
                    <Icon type={'FontAwesome5'} name={'edit'} 
                        style={props.disableEdit ? styles.disabledIcon : styles.buttonIcon}></Icon>
                    <Label style={{fontSize: 12}}>Review</Label>
                </Button>
                <Button small rounded transparent style={styles.roundButton}
                    onPress={onOpenMaps}>
                    <Icon type={'FontAwesome5'} name={'directions'} style={styles.buttonIcon}></Icon>
                    <Label style={{fontSize: 12}}>Directions</Label>
                </Button>
                {
                    props.place.formatted_phone_number != null ? 
                        <Button small rounded transparent style={styles.roundButton}
                            onPress={()=>Linking.openURL(`tel:${props.place.formatted_phone_number}`)}>
                            <Icon type={'FontAwesome5'} name={'phone'} style={styles.buttonIcon}></Icon>
                            <Label style={{fontSize: 12}}>Call</Label>
                        </Button> : null
                }
                {
                    props.place.website != null ? 
                        <Button small rounded transparent style={styles.roundButton}
                            onPress={()=>Linking.openURL(`${props.place.website}`)}>
                            <Icon type={'FontAwesome5'} name={'globe'} style={styles.buttonIcon}></Icon>
                            <Label style={{fontSize: 12}}>Website</Label>
                        </Button> : null
                }
                {
                    <Button small rounded transparent style={styles.roundButton}
                        onPress={()=>{alert("not implemented")}}>
                        <Icon type={'FontAwesome5'} name={'share'} style={styles.buttonIcon}></Icon>
                        <Label style={{fontSize: 12}}>Share</Label>
                    </Button>
                }
                {/* <Button small rounded transparent style={styles.roundButton}
                    onPress={()=>{alert("not implemented")}}>
                    <Icon type={'FontAwesome5'} name={'star'} style={styles.buttonIcon}></Icon>
                    <Label style={{fontSize: 12}}>Favorite</Label>
                </Button> */}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        margin: 5
    },
    roundButton: {
        margin: 5,
        width: 80,
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50,
        flexDirection: 'column'
    },
    disabledButton: {
        margin: 5,
        width: 80,
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50,
        flexDirection: 'column',
        opacity: .5
    },
    buttonIcon:{
        color: theme.PRIMARY_COLOR
    },
    disabledIcon: {
        color: theme.PRIMARY_COLOR
    }
  });