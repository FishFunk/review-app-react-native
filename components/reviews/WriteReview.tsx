import React, { Component } from 'react';
import { Modal, View, StyleSheet, Dimensions, ScrollView, NativeSyntheticEvent, TextInputKeyPressEventData, Keyboard } from 'react-native';
import { 
    Button, 
    Text, 
    Form, 
    Item, 
    Textarea, 
    Label, 
    Title, 
    Toast
} from 'native-base'
import theme from '../../styles/theme';
import ReviewStars from './ReviewStars';
import EditableStars from './EditableStars';
import { fullApiPlace } from '../../models/place';
import FirebaseService from '../../services/firebaseService';
import _indexOf from 'lodash/indexOf';

export default class WriteReview extends Component<{ 
        showModal: boolean, 
        onDismissModal: Function,
        place: fullApiPlace
    },
    {
        rating1: number,
        rating2: number
        rating3: number,
        comments: string
    }> {

    constructor(props: any){
        super(props);
        this.state = {
            rating1: 0,
            rating2: 0,
            rating3: 0,
            comments: ''
        }
    }

    onDismissModal(){
        this.props.onDismissModal();
    }

    onEditComment(text: string){
        this.setState({ comments: text });
    }

    onUpdateRating1(newRating: number){
        this.setState({ rating1: newRating });
    }

    onUpdateRating2(newRating: number){
        this.setState({ rating2: newRating });
    }

    onUpdateRating3(newRating: number){
        this.setState({ rating3: newRating });
    }

    onKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>){
        if(e.nativeEvent.key === 'Enter'){
            e.preventDefault();
            Keyboard.dismiss();
        }
    }

    isFoodEsablishment(){
        const { place } = this.props;

        if(place.types){
            return (
                _indexOf(place.types, 'restaurant') >= 0 || 
                _indexOf(place.types, 'food')  >= 0);
        }

        return false;
    }

    async onSubmitForm(){
        const { place_id, name } = this.props.place;
        const reviewData = {
            place_id: place_id,
            place_name: name,
            atmosphere: this.state.rating1,
            menu: this.state.rating2,
            service: this.state.rating3,
            comments: this.state.comments,
            avg_rating: this.avgRating()
        }

        await FirebaseService.submitReview(this.props.place, reviewData);
        this.onDismissModal();
    }

    avgRating(){
        if(this.isFoodEsablishment()){
            const avg = (this.state.rating1 + this.state.rating2 + this.state.rating3) / 3;
            return +avg.toFixed(1);
        } 
        
        return this.state.rating1;
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
                <ScrollView contentContainerStyle={styles.modalView}>
                    <View>
                        <Title>
                            <Text style={styles.title}>{this.props.place.name}</Text>
                        </Title>
                    </View>
                    <View style={styles.formContainer}>
                        {
                            this.isFoodEsablishment() ? 
                            // Food / Restaurant Review Form
                            <Form style={styles.form}>
                                <Item bordered={false} style={styles.starItem}>
                                    <Label>Atmosphere</Label>
                                    <EditableStars 
                                        fontSize={30}
                                        initalRating={this.state.rating1} 
                                        onRatingChanged={this.onUpdateRating1.bind(this)}  />
                                </Item>
                                <Item bordered={false} style={styles.starItem}>
                                    <Label>Food</Label>
                                    <EditableStars 
                                        fontSize={30}
                                        initalRating={this.state.rating2} 
                                        onRatingChanged={this.onUpdateRating2.bind(this)}  />
                                </Item>
                                <Item bordered={false} style={styles.starItem}>
                                    <Label>Service</Label>
                                    <EditableStars 
                                        fontSize={30}
                                        initalRating={this.state.rating3} 
                                        onRatingChanged={this.onUpdateRating3.bind(this)}  />
                                </Item>
                                <Item stackedLabel style={styles.textAreaItem}>
                                    <Label>Comments</Label>
                                    <Label style={styles.sublabel}>up to 250 characters</Label>
                                    <Textarea 
                                        returnKeyType='done'
                                        onKeyPress={this.onKeyPress.bind(this)}
                                        value={this.state.comments}
                                        maxLength={250}
                                        multiline={true}
                                        onChangeText={this.onEditComment.bind(this)}
                                        style={styles.textArea} 
                                        rowSpan={4} 
                                        bordered={false} 
                                        underline={false}/>
                                </Item>
                                <Item stackedLabel>
                                    <Label>Average</Label>
                                    <ReviewStars rating={this.avgRating()} fontSize={30} />
                                </Item>
                            </Form> : 
                            // Generic Place Review Form
                            <Form>
                                <Item bordered={false} style={styles.starItem}>
                                    <Label>Rating</Label>
                                    <EditableStars 
                                        fontSize={30}
                                        initalRating={this.state.rating1} 
                                        onRatingChanged={this.onUpdateRating1.bind(this)}  />
                                </Item>
                                <Item stackedLabel style={styles.textAreaItem}>
                                    <Label>Comments</Label>
                                    <Label style={styles.sublabel}>up to 250 characters</Label>
                                    <Textarea 
                                        returnKeyType='done'
                                        onKeyPress={this.onKeyPress.bind(this)}
                                        value={this.state.comments}
                                        maxLength={250}
                                        multiline={true}
                                        onChangeText={this.onEditComment.bind(this)}
                                        style={styles.textArea} 
                                        rowSpan={4} 
                                        bordered={false} 
                                        underline={false}/>
                                </Item>
                            </Form>
                        }
                        
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button 
                            style={styles.submitButton}
                            full 
                            onPress={this.onSubmitForm.bind(this)}>
                            <Text style={{color: theme.DARK_COLOR}}>Submit</Text>
                        </Button>
                        <Button 
                            style={styles.cancelButton}
                            full 
                            transparent 
                            onPress={this.onDismissModal.bind(this)}>
                                <Text style={{color: theme.DANGER_COLOR}}>Cancel</Text>
                        </Button>
                    </View>
                </ScrollView>
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
        width: Dimensions.get('screen').width,
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
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 40
    },
    form: {
        width: '100%'
    },
    header: {
        flexDirection: 'row',
        width: '100%'
    },
    modalText: {
        textAlign: "center"
    },
    buttonGroup: {
        width: '50%',
        justifyContent: 'center'
    },
    submitButton: {
        backgroundColor: theme.SECONDARY_COLOR
    },
    cancelButton: {
        marginTop: 20
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
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginBottom: 10
    },
    title: {
        fontSize: 30,
        color: theme.DARK_COLOR
    },
    sublabel: {
        fontSize: 12,
        fontWeight: '200'
    }
})
