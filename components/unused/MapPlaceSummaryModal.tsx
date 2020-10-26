import React from "react";
import { StyleSheet } from 'react-native';
import PlaceDetails from "../map/PlaceDetails";
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Content } from "native-base";

export default class MapPlaceSummaryModal extends React.Component<
    { 
        apiKey: string, 
        isOpen: boolean, 
        placeId: string, 
        toggleSummaryModal: () => void
    }>{

    render(){
        return (
            <Modal
                style={styles.modal}
                propagateSwipe
                isVisible={this.props.isOpen}
                animationIn={'slideInUp'}
                onBackdropPress={() => this.props.toggleSummaryModal()}
                onSwipeComplete={()=>this.props.toggleSummaryModal()}
                swipeDirection="down"
            >
                <Content scrollEnabled={false}>
                    {/* <PlaceDetails 
                        apiKey={this.props.apiKey}
                        placeId={this.props.placeId} 
                        toggleSummaryModal={this.props.toggleSummaryModal}/> */}
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