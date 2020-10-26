import React from "react";
import { Dimensions, StyleSheet, Image } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Body, Button, Content, Icon, Label, Left, List, ListItem, Right, Text, Thumbnail, Title, View } from "native-base";
import { dbPlace } from "../../models/place";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import ReviewStars from "../reviews/ReviewStars";
import { getGooglePlaceById, getPhotoUrl } from '../../services/googlePlaceApiService';
import ReviewDollars from "../reviews/ReviewDollars";
import SpinnerContainer from "../SpinnerContainer";
import PlaceList from "./PlaceList";

export default class PlaceListModal extends React.Component<
    { 
        apiKey: string,
        isOpen: boolean, 
        places: dbPlace[], 
        onDismissModal: () => any,
        onShowPlaceDetails: (placeId: string) => any
    }>{

    render(){
        return (
            <Modal
                style={styles.modal}
                propagateSwipe
                isVisible={this.props.isOpen}
                animationIn={'slideInUp'}
                onBackdropPress={() => this.props.onDismissModal()}
                onSwipeComplete={() => this.props.onDismissModal()}
                swipeDirection="down">
                <Content scrollEnabled={false}>
                    <PlaceList 
                        apiKey={this.props.apiKey}
                        places={this.props.places}
                        onShowPlaceDetails={this.props.onShowPlaceDetails.bind(this)}/>
                </Content>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        marginTop: 100,
        backgroundColor: theme.LIGHT_COLOR,
        width: '100%',
        margin: 0
    }
});