import React, { Component } from 'react';
import { Modal, View, StyleSheet, Dimensions, ScrollView, NativeSyntheticEvent, TextInputKeyPressEventData, Keyboard } from 'react-native';
import { 
    Button, 
    Text, 
    Form, 
    Item, 
    Textarea, 
    Label, 
    Toast,
    Root,
    Spinner
} from 'native-base'
import theme from '../../styles/theme';
import ReviewStars from './ReviewStars';
import EditableStars from './EditableStars';
import { fullApiPlace } from '../../models/place';
import FirebaseService from '../../services/firebaseService';
import _indexOf from 'lodash/indexOf';
import _some from 'lodash/some';
import { TouchableOpacity } from 'react-native-gesture-handler';
import EditableDollars from './EditableDollars';

export default class WriteReview extends Component<{ 
        showModal: boolean, 
        onDismissModal: Function,
        place: fullApiPlace
    },
    {
        rating1: number,
        rating2: number
        rating3: number,
        pricing: number,
        comments: string,
        submittingReview: boolean
    }> {

    constructor(props: any){
        super(props);
        this.state = {
            rating1: 0,
            rating2: 0,
            rating3: 0,
            pricing: 0,
            comments: '',
            submittingReview: false
        }
    }

    onDismissModal(showReviewComplete: boolean){
        Keyboard.dismiss();
        this.props.onDismissModal(showReviewComplete);
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

    onUpdatePricing(newRating: number){
        this.setState({ pricing: newRating });
    }

    onKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>){
        if(e.nativeEvent.key === 'Enter'){
            e.preventDefault();
            Keyboard.dismiss();
        }
    }

    isServiceEstablishment(){
        const { place } = this.props;

        if(place.types){
            const matchingTypes = [
                'bar', 
                'cafe', 
                'food', 
                'restaurant', 
                'bakery',
                'spa',
                'beauty_salon',
                'hair_care',
                'lodging',
                'night_club'];
            
            return _some(place.types, (type)=>_indexOf(matchingTypes, type) >= 0);
        }

        return false;
    }

    async onSubmitForm(){
        Keyboard.dismiss();
        const { place_id, name } = this.props.place;
        const { rating1, rating2, rating3, pricing, comments } = this.state;
        const avg = this.avgRating();

        if(avg === 0){
            Toast.show({
                position: 'top',
                text: 'That bad? Select a star rating between 1 and 5.',
                duration: 3000,
                buttonText: 'Ok'
            });
            return;
        }

        if(this.isServiceEstablishment() && pricing === 0){
            Toast.show({
                position: 'top',
                text: 'Please select a price rating.',
                duration: 3000,
                buttonText: 'Ok'
            });
            return;
        }

        if(comments.trim().length === 0){
            Toast.show({
                position: 'top',
                text: 'Please enter a sentence or two about your experience.',
                duration: 3000,
                buttonText: 'Ok'
            });
            return;
        }

        const reviewData = {
            place_id: place_id,
            place_name: name,
            atmosphere: rating1,
            menu: rating2,
            service: rating3,
            comments: comments,
            pricing: pricing,
            avg_rating: this.avgRating()
        }

        this.setState({ submittingReview: true });
        await FirebaseService.submitReview(this.props.place, reviewData);
        
        this.onDismissModal(true);
    }

    avgRating(){
        if(this.isServiceEstablishment()){
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
            <Root>
            <ScrollView contentContainerStyle={styles.modalView} bounces={false}>
                <View>
                    <Text style={styles.title}>{this.props.place.name}</Text>
                </View>
                <View style={styles.formContainer}>
                    {
                        this.isServiceEstablishment() ? 
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
                                <Label>Quality</Label>
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
                            <Item bordered={false} style={styles.starItem}>
                                <Label>Pricing</Label>
                                <EditableDollars 
                                    fontSize={30}
                                    initalRating={this.state.pricing} 
                                    onRatingChanged={this.onUpdatePricing.bind(this)}  />
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
                            <Item stackedLabel style={styles.starItem}>
                                <Label>Average Total</Label>
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
                    <TouchableOpacity onPress={this.onDismissModal.bind(this, false)} disabled={this.state.submittingReview}> 
                        <Button style={styles.cancelButton}>
                            <Text>Cancel</Text>
                        </Button>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onSubmitForm.bind(this)} disabled={this.state.submittingReview}> 
                        <Button style={styles.submitButton}>
                            {
                                this.state.submittingReview ? 
                                    <Spinner color={theme.LIGHT_COLOR} size={12} style={{width: 80}}/> : 
                                    <Text>Submit</Text>
                            }
                        </Button>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </Root>
        </Modal>
        )
    }
}

const styles=StyleSheet.create({
    modalView: {
        paddingTop: 40,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        backgroundColor: theme.LIGHT_COLOR,
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
        padding: 20
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
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginBottom: 12,
        alignItems: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    sublabel: {
        fontSize: 12,
        fontWeight: '200'
    }
})
