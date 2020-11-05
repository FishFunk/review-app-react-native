import React from "react";
import { StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import theme from "../styles/theme";
import { Content } from "native-base";
import LicenseAgreement from "./LicenseAgreement";

export default class LicenseAgreementModal extends React.Component<
    { 
        isOpen: boolean, 
        onDismissModal: () => any
    }>{

    render(){
        return (
            <Modal
                style={styles.modal}
                propagateSwipe={false}
                isVisible={this.props.isOpen}
                animationIn={'slideInUp'}
                onBackdropPress={() => this.props.onDismissModal()}>
                    <Content scrollEnabled={false}>
                        <LicenseAgreement onDismissModal={this.props.onDismissModal}/>
                    </Content>
            </Modal>)
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