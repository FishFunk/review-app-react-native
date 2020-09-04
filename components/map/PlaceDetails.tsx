import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
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
    { placeId: string, toggleSummaryModal: Function },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean,
        photoUrls: Array<string>
    }> {

    state = {
        isLoading: true,
        showReviewModal: false,
        items: new Array<reviewSummary>(),
        place: {},
        photoUrls: new Array<string>(),
        disableEdit: true
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

        this.setState({
            showReviewModal: false,
            items: reviews,
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
                    <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <Button transparent onPress={this.onDismissPanel.bind(this)}>
                            <Icon type="FontAwesome" name="close"></Icon>
                        </Button>
                        <Text style={styles.title}>{this.state.place.name}</Text>
                        <Button transparent onPress={this.onPressWriteReview.bind(this)} disabled={this.state.disableEdit}>
                            <Icon type="FontAwesome" name="edit"></Icon>
                        </Button>
                    </View>
                    <HorizontalPhotoList photoUrls={this.state.photoUrls} />
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
        marginTop: '20%',
        // backgroundColor: '#DCDCDC',
        alignItems: 'center'
    }
  });