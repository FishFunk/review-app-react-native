import React from "react";
import { StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { placeMarkerData } from "../../models/place";
import PlaceList from "./PlaceList";

export default class PlaceListModal extends React.Component<
    { 
        apiKey: string,
        isOpen: boolean, 
        places: placeMarkerData[], 
        onDismissModal: () => any,
        onUpdateSortOrder: (orderBy: string) => any,
        onShowPlaceDetails: (placeSummary: placeMarkerData) => any,
        onLoadMoreResults: ()=> any,
        orderBy: string,
        showLoadMoreOption: boolean
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
                        onLoadMoreResults={this.props.onLoadMoreResults.bind(this)}
                        orderBy={this.props.orderBy}
                        showLoadMoreOption={this.props.showLoadMoreOption}/>
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