import React from "react";
import { StyleSheet, View, Dimensions } from 'react-native';
import PlaceDetails from "./PlaceDetails";
import Modal from "react-native-modal";
import theme from "../../styles/theme";

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
                <PlaceDetails 
                    placeId={this.props.placeId} 
                    toggleSummaryModal={this.props.toggleSummaryModal}/>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        marginTop: 100,
        height: Dimensions.get('screen').height - 100,
        width: '100%',
        backgroundColor: theme.LIGHT_COLOR,
        margin: 0
    }
});