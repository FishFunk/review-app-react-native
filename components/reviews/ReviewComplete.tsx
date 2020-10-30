import React, { Component } from 'react';
import { Modal, View, StyleSheet, Dimensions } from 'react-native';
import { 
    Button, 
    Text
} from 'native-base'
import ConfettiCannon from 'react-native-confetti-cannon';
import theme from '../../styles/theme';

export default class ReviewComplete extends Component<{ 
        showModal: boolean, 
        onDismissModal: ()=>void
    },
    {}> {

    render(){
        const { showModal, onDismissModal } = this.props;
        return (
        <Modal
            onDismiss={onDismissModal}
            visible={showModal}
            animationType={'slide'}
            transparent={true}
        >
            <View style={styles.modalView}>
                <ConfettiCannon count={200} origin={{x: 100, y: 0}} autoStartDelay={300}/>
                <Text style={styles.bigText}>You're awesome!</Text>
                <Text style={styles.regularText}>
                    Thank you for improving our community one review at a time!
                </Text>
                <View style={styles.buttonGroup}>
                    {/* <Button >
                        <Text>Share Your Review</Text>
                    </Button> */}
                    <Button onPress={this.props.onDismissModal}>
                        <Text>Close</Text>
                    </Button>
                </View>
            </View>
        </Modal>
        )
    }
}

const styles=StyleSheet.create({
    modalView: {
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        backgroundColor: theme.LIGHT_COLOR,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    bigText: {
        textAlign: 'center',
        fontSize: 56,
        fontWeight: 'bold'
    },
    regularText: {
        padding: 10,
        fontSize: 24,
        textAlign: 'center'
    },
    buttonGroup: {
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
})
