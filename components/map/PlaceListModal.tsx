import React from "react";
import { StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Content } from "native-base";
import { dbPlace } from "../../models/place";
import PlaceList from "./PlaceList";

export default class PlaceListModal extends React.Component<
    { 
        apiKey: string,
        isOpen: boolean, 
        places: dbPlace[], 
        onDismissModal: () => any,
        onUpdateSortOrder: (orderBy: string) => any,
        onShowPlaceDetails: (placeId: string) => any,
        orderBy: string
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
                    <PlaceList 
                        apiKey={this.props.apiKey}
                        places={this.props.places}
                        onShowPlaceDetails={this.props.onShowPlaceDetails.bind(this)}
                        onUpdateSortOrder={this.props.onUpdateSortOrder.bind(this)} 
                        orderBy={this.props.orderBy}/>
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