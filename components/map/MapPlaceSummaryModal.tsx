import React from "react";
import { StyleSheet, View } from 'react-native';
import PlaceDetails from "./PlaceDetails";
import Modal from "react-native-modal";
import { fullApiPlace } from "../../models/place";

export default class MapPlaceSummaryModal extends React.Component<
    { isOpen: boolean, placeId: string, toggleSummaryModal: Function }>{

    render(){
        return (
            <Modal
                style={styles.modal}
                propagateSwipe
                isVisible={this.props.isOpen}
                animationIn={'slideInUp'}
                onBackdropPress={() => this.props.toggleSummaryModal()}
                onSwipeComplete={() => this.props.toggleSummaryModal()}
                swipeDirection="down"
            >
                <View style={styles.modalView}>
                    <PlaceDetails 
                        placeId={this.props.placeId} 
                        toggleSummaryModal={this.props.toggleSummaryModal}/>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        margin: 0
    },
    modalView: {
        marginTop: 200,
        marginRight: 0,
        marginLeft: 0,
        marginBottom: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        backgroundColor: "white"
    }
});