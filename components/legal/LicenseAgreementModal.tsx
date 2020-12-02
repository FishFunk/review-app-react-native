import React from "react";
import { StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Content } from "native-base";
import LicenseAgreement from "./LicenseAgreement";
import PrivacyPolicy from "./PrivacyPolicy";

export default class LegalModal extends React.Component<
    { 
        isOpen: boolean, 
        onDismissModal: () => any,
        type: 'license' | 'privacy'
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
                        {
                            this.props.type === 'license' ?
                                <LicenseAgreement onDismissModal={this.props.onDismissModal}/> :
                                <PrivacyPolicy onDismissModal={this.props.onDismissModal}/>
                        }
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