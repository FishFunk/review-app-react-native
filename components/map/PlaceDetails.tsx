import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { 
    List, 
    ListItem, 
    Text, 
    Body, 
    Left, 
    Right, 
    Thumbnail,
    Button,
    Icon,
    Spinner,
    Title,
    Label
} from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import FirebaseService from '../../services/firebaseService';
import { reviewSummary } from '../../models/reviews';
import theme from '../../styles/theme';
import WriteReview from '../reviews/WriteReview';
import { getGooglePlaceById, getPhotoUrl } from '../../services/googlePlaceApiService';
import { fullApiPlace } from '../../models/place';
import _indexOf from 'lodash/indexOf';
import HorizontalPhotoList from '../HorizontalPhotoList';

export default class PlaceDetails extends React.Component<
    { placeId: string, toggleSummaryModal: Function },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean,
        photoUrls: Array<string>,
        total: number
    }> {

    initialPlace: fullApiPlace = {};

    state = {
        isLoading: true,
        showReviewModal: false,
        items: new Array<reviewSummary>(),
        place: this.initialPlace,
        photoUrls: new Array<string>(),
        disableEdit: true,
        total: 0
    }


    componentDidMount(){
        this.load()
            .catch(error => console.error(error));
    }

    async load(){
        const reviews = await FirebaseService.getReviews(this.props.placeId)
        const place = await getGooglePlaceById(this.props.placeId);
        const userReviewIds = await FirebaseService.getUserReviewIdList();
        let photoUrls = []

        if(place.photos){
            // prefetch up to 3 photos
            for(let i=0; i<3; i++){
                if(place.photos[i]){
                    const url = getPhotoUrl(place.photos[i].photo_reference);
                    await Image.prefetch(url);
                    photoUrls.push(url);
                }
            }
        }

        let total = 0;
        if(reviews && reviews.length > 0){
            let sum = 0;
            for(let r of reviews){
                sum += r.avg_rating;
            }
            total = sum/reviews.length;
        }

        console.log(place);

        this.setState({
            showReviewModal: false,
            items: reviews,
            total: total,
            place: place,
            photoUrls: photoUrls,
            isLoading: false,
            disableEdit: _indexOf(userReviewIds, place.place_id) > -1
        });
    }

    onPressWriteReview(){
        this.setState({ showReviewModal: true });
    }

    onDismissPanel(){
        this.props.toggleSummaryModal(false);
    }

    onDismissModal(){
        this.load();
    }

    render() {
        return (
        <View style={styles.container}>
            {
                this.state.isLoading ?
                <Spinner color={theme.PRIMARY_COLOR} /> :
                <View>
                    <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                        <Text style={styles.title}>{this.state.place.name}</Text>
                        <View style={{alignSelf: 'center'}}>
                            <ReviewStars rating={this.state.total} fontSize={22}/>
                        </View>
                    </View>
                    <HorizontalPhotoList photoUrls={this.state.photoUrls} />
                    <View style={styles.buttonContainer}>
                        {
                            this.state.place.formatted_phone_number != null ? 
                                <Button small rounded transparent style={styles.roundButton}
                                    onPress={()=>Linking.openURL(`tel:${this.state.place.formatted_phone_number}`)}>
                                    <Icon type={'FontAwesome5'} name={'phone'} style={styles.buttonIcon}></Icon>
                                </Button> : null
                        }
                        {
                            this.state.place.website != null ? 
                                <Button small rounded transparent style={styles.roundButton}
                                    onPress={()=>Linking.openURL(`${this.state.place.website}`)}>
                                    <Icon type={'FontAwesome5'} name={'globe'} style={styles.buttonIcon}></Icon>
                                </Button> : null
                        }

                        <Button small rounded transparent 
                            style={styles.roundButton} onPress={this.onPressWriteReview.bind(this)}
                            disabled={this.state.disableEdit}>
                            <Icon type={'FontAwesome5'} name={'edit'} style={styles.buttonIcon}></Icon>
                        </Button>
                    </View>
                    {       
                        this.state.items.length > 0 ?             
                        <ScrollView>
                            <List style={styles.list}>
                                {
                                    this.state.items.map((item: reviewSummary, idx: number)=> 
                                        <ListItem avatar key={idx} style={styles.listItem}>
                                            <Left>
                                                <Thumbnail source={{ uri: item.img }} defaultSource={require('../../assets/images/profile.png')} />
                                            </Left>
                                            <Body>
                                                <ReviewStars rating={item.avg_rating} fontSize={18} />
                                                <Text>{item.name}</Text>
                                                <Text note>{item.comments}</Text>
                                            </Body>
                                            <Right>
                                                <Text note>{ item.date }</Text>
                                            </Right>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </ScrollView> :
                        <View style={styles.noReviewConatiner}>
                            <Title>No Reviews Yet</Title>
                            <Text>Be the first to write one!</Text>
                        </View>
                    }
                </View>
            }
            <WriteReview 
                place={this.state.place}
                showModal={this.state.showReviewModal} 
                onDismissModal={this.onDismissModal.bind(this)}/>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
    list: {
        padding: 5
    },
    listItem: {
        padding: 5
    },
    dismissButton: {
    },
    editButton: {
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    },
    noReviewConatiner: {
        width: '100%',
        marginTop: 20,
        // backgroundColor: '#DCDCDC',
        alignItems: 'center'
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10
    },
    roundButton: {
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50
    },
    buttonIcon:{
        color: theme.PRIMARY_COLOR
    }
  });