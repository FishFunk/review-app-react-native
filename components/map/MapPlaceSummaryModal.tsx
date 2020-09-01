import React from "react";
import { StyleSheet, View, Animated, Modal } from 'react-native';
import PlaceDetails from "./PlaceDetails";
import { TouchableOpacity } from "react-native-gesture-handler";

export default class MapPlaceSummaryModal extends React.Component<
    {isOpen: boolean, placeId: string, toggleSummaryModal: Function}> {

    render(){
        return (
            <Modal
                visible={this.props.isOpen}
                animationType={'slide'}
                transparent={true}
            >
                <View style={styles.container}>
                    <View style={styles.modalView}>
                        <PlaceDetails 
                            placeId={this.props.placeId} 
                            toggleSummaryModal={this.props.toggleSummaryModal}/>
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalView: {
        marginTop: 400,
        height: '100%',
        width: '100%',
        backgroundColor: "white",
        padding: 10,
        // alignItems: "center",
        // borderRadius: 20,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5
    }
});