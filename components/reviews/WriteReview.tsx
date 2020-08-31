import React, { Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Icon, Button, Input, Text, Form, Item, Textarea, Label } from 'native-base'
import theme from '../../styles/theme';
import ReviewStars from './ReviewStars';
import EditableStars from './EditableStars';

export default class WriteReview extends Component<{ showModal: boolean, onDismissModal: Function }> {
    constructor(props: any){
        super(props);
        this.state = {
        }
    }

    onDismissModal(){
        this.props.onDismissModal();
    }

    onUpdateRating(newRating: number){
        console.log("new star rating: " + newRating);
    }

    render(){
        const { showModal } = this.props;
        return (
        <Modal
            visible={showModal}
            animationType={'slide'}
            transparent={true}
        >
            <View style={styles.container}>
                <View style={styles.modalView}>
                    {/* <View style={styles.header}>
                        <Button transparent onPress={this.onDismissModal.bind(this)}>
                            <Icon style={styles.closeButton} name='close' type="FontAwesome" />
                        </Button>
                    </View> */}
                    <View style={styles.formContainer}>
                        <Form style={styles.form}>
                            <Item stackedLabel bordered={false} style={styles.starItem}>
                                <Label>Rating</Label>
                                <EditableStars onRatingChanged={this.onUpdateRating.bind(this)}  />
                            </Item>
                            <Item stackedLabel style={styles.textAreaItem}>
                                <Label>Comments</Label>
                                <Textarea 
                                    style={styles.textArea} 
                                    rowSpan={4} 
                                    bordered={false} 
                                    underline={false}/>
                            </Item>
                        </Form>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button style={styles.submitButton}><Text>Submit</Text></Button>
                        <Button style={styles.cancelButton} onPress={this.onDismissModal.bind(this)}><Text>Cancel</Text></Button>
                    </View>
                </View>
            </View>
        </Modal>
        )
    }
}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        marginTop: 60,
        height: '100%',
        width: '100%',
        backgroundColor: "white",
        padding: 10,
        alignItems: "center",
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
    formContainer: {
        width: '100%',
        height: 350,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10
    },
    form: {
        width: '100%'
    },
    header: {
        flexDirection: 'row',
        width: '100%'
    },
    closeButton: {
        color: theme.PRIMARY_COLOR,
        fontSize: 20
    },
    modalText: {
        textAlign: "center"
    },
    buttonGroup: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    submitButton: {
        backgroundColor: theme.PRIMARY_COLOR
    },
    cancelButton: {
        backgroundColor: theme.DANGER_COLOR
    },
    textAreaItem: {
        borderBottomWidth: 0
    },
    textArea: {
        marginTop: 15,
        width: '100%',
        borderWidth: 0.5,
        borderColor: theme.DARK_COLOR
    },
    starItem: {
        borderBottomWidth: 0,
        marginBottom: 10
    }
})
