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
    Title
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
    { apiKey: string, placeId: string, toggleSummaryModal: Function },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean,
        photoUrls: Array<string>,
        total: number
    }> {

    initialPlace: fullApiPlace = {}

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
            .catch(error => FirebaseService.logError(error));
    }

    async load(){
        const reviews = await FirebaseService.getReviewSummaries(this.props.placeId)
        const place = await getGooglePlaceById(this.props.apiKey, this.props.placeId);
        const userReviewIds = await FirebaseService.getUserReviewIdList();
        let photoUrls = []

        if(place.photos){
            // prefetch up to 3 photos
            for(let i=0; i<3; i++){
                if(place.photos[i]){
                    const url = getPhotoUrl(this.props.apiKey, place.photos[i].photo_reference);
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
                    <View style={styles.titleView}>
                        <Text style={styles.title}>{this.state.place.name}</Text>
                        <View style={styles.starsView}>
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
                            style={this.state.disableEdit ? styles.disabledButton : styles.roundButton} 
                            onPress={this.onPressWriteReview.bind(this)}
                            disabled={this.state.disableEdit}>
                            <Icon type={'FontAwesome5'} name={'edit'} 
                                style={this.state.disableEdit ? styles.disabledIcon : styles.buttonIcon}></Icon>
                        </Button>
                    </View>
                    {       
                        this.state.items.length > 0 ?     
                        <View>        
                            <ScrollView>
                                <List style={styles.list}>
                                    {
                                        this.state.items.map((item: reviewSummary, idx: number)=> 
                                            <ListItem avatar key={idx}>
                                                <Left>
                                                    <Thumbnail 
                                                        source={{ uri: item.img }} 
                                                        defaultSource={require('../../assets/images/profile.png')} />
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
                            </ScrollView>
                        </View> :
                        <View style={styles.noReviewConatiner}>
                            <Title>Hmm... No Reviews From Your Network</Title>
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
        height: '100%'
    },
    titleView: {
        flexDirection: 'column', 
        justifyContent: 'center',
        marginTop: 10,
        height: 40
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center'
    },
    starsView: {
        marginTop: 5,
        alignSelf: 'center'
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
    },
    disabledButton: {
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50,
        opacity: .5
    },
    disabledIcon: {
        color: theme.PRIMARY_COLOR
    },
    list: {
        paddingRight: 5
    },
    noReviewConatiner: {
        minHeight: 200,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
  });