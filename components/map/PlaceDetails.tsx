import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking, Dimensions } from 'react-native';
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
    Title,
    Badge,
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
import openMap from 'react-native-open-maps';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getPlaceAvgPricing, getPlaceAvgRating } from '../../services/utils';
import _find from 'lodash/find';
import SpinnerContainer from '../SpinnerContainer';
import ReviewComplete from '../reviews/ReviewComplete';
import ReviewDollars from '../reviews/ReviewDollars';

export default class PlaceDetails extends React.Component<
    { 
        navigation: any,
        apiKey: string, 
        placeId: string, 
        toggleSummaryModal: Function
    },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        showReviewCompleteModal: boolean,
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean,
        photoUrls: Array<string>,
        rating: number,
        pricing: number
    }> {

    initialPlace: fullApiPlace = {}

    state = {
        isLoading: true,
        showReviewModal: false,
        showReviewCompleteModal: false,
        items: new Array<reviewSummary>(),
        place: this.initialPlace,
        photoUrls: new Array<string>(),
        disableEdit: true,
        rating: 0,
        pricing: 0
    }


    componentDidMount(){
        this.load()
            .catch(error => FirebaseService.logError(error));
    }

    async load(){
        const place = await getGooglePlaceById(this.props.apiKey, this.props.placeId);

        this.setState({ place: place });

        let photoUrls = []
        if(place && place.photos){
            // prefetch up to 3 photos
            for(let i=0; i<3; i++){
                if(place.photos[i]){
                    const url = getPhotoUrl(this.props.apiKey, place.photos[i].photo_reference);
                    await Image.prefetch(url);
                    photoUrls.push(url);
                    this.setState({ photoUrls: photoUrls });
                }
            }
        }

        const reviewState = await this.getReviewState();

        this.setState({
            ...reviewState,
            isLoading: false
        });
    }

    async getReviewState(){
        const userId = FirebaseService.getCurrentUserId();
        const dbPlace = await FirebaseService.getPlace(this.props.placeId);
        const reviews = await FirebaseService.getReviewSummaries(this.props.placeId)

        let total = getPlaceAvgRating(dbPlace);
        let pricing = getPlaceAvgPricing(dbPlace);
        let disableEditing = _find(dbPlace?.reviews, (r) => r.reviewer_id === userId) != null;

        return { items: reviews, rating: total, pricing: pricing, disableEdit: disableEditing };
    }

    onPressWriteReview(){
        this.setState({ showReviewModal: true });
    }

    onDismissPanel(){
        this.props.toggleSummaryModal(false);
    }

    async onDismissModal(showReviewComplete: boolean){
        if(showReviewComplete){
            // Review submitted - reload detail view and show review confirmation modal
            this.setState({ 
                isLoading: true, 
                showReviewModal: false, 
                showReviewCompleteModal: true });
            const newReviewState = await this.getReviewState();
            this.setState({ ...newReviewState, isLoading: false });

        } else {
            this.setState({ showReviewModal: false });
        }
    }

    onDismissReviewCompleteModal(){
        this.setState({ showReviewCompleteModal: false });
    }

    onOpenMaps(){
        const { formatted_address, name } = this.state.place;
        
        openMap({ 
            // latitude: lat,
            // longitude: lng, 
            query: name, 
            end: formatted_address });
    }

    render() {
        return (
        <View style={styles.container}>
            {
                // this.state.isLoading ?
                // <SpinnerContainer /> :
                <View>
                    <View style={styles.titleView}>
                        <View>
                            <Button 
                                transparent
                                style={{ width: 50, height: 50}}
                                onPress={this.props.navigation.goBack}>
                                <Icon 
                                    style={styles.buttonIcon}
                                    name={'arrow-left'} 
                                    type={'FontAwesome5'}/>
                            </Button>
                        </View>
                        <View>
                            <Text style={styles.title}>{this.state.place.name}</Text>
                            <TouchableOpacity 
                                containerStyle = {styles.starTouchable}
                                style={styles.starsView} 
                                onPress={this.onPressWriteReview.bind(this)}
                                disabled={this.state.disableEdit}>
                                <ReviewStars rating={this.state.rating} fontSize={22}/>
                            </TouchableOpacity>
                            <ReviewDollars style={{alignSelf: 'center', marginBottom: 10}} rating={this.state.pricing} fontSize={14}/>
                        </View>
                        <View style={{ width: 50, height: 50 ,justifyContent: 'center'}}>
                            {this.state.isLoading ? <SpinnerContainer /> : null }
                        </View>
                    </View>
                    {
                        this.state.place.business_status === 'CLOSED_TEMPORARILY' ?
                        <Badge style={styles.badge}>
                            <Text style={styles.badgeText}>Closed Temporarily</Text>
                        </Badge> : null
                    }
                    {
                        this.state.place.business_status === 'CLOSED_PERMANENTLY' ?
                        <Badge style={styles.badge}>
                            <Text style={styles.badgeText}>Closed Permanently</Text>
                        </Badge> : null
                    }
                    <View>
                        <HorizontalPhotoList photoUrls={this.state.photoUrls} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <ScrollView 
                            style={{alignSelf: 'center'}}
                            horizontal 
                            showsHorizontalScrollIndicator={false}>
                            <Button small rounded transparent 
                                style={this.state.disableEdit ? styles.disabledButton : styles.roundButton} 
                                onPress={this.onPressWriteReview.bind(this)}
                                disabled={this.state.disableEdit}>
                                <Icon type={'FontAwesome5'} name={'edit'} 
                                    style={this.state.disableEdit ? styles.disabledIcon : styles.buttonIcon}></Icon>
                                <Label style={{fontSize: 12}}>Review</Label>
                            </Button>
                            <Button small rounded transparent style={styles.roundButton}
                                onPress={this.onOpenMaps.bind(this)}>
                                <Icon type={'FontAwesome5'} name={'directions'} style={styles.buttonIcon}></Icon>
                                <Label style={{fontSize: 12}}>Directions</Label>
                            </Button>
                            {
                                this.state.place.formatted_phone_number != null ? 
                                    <Button small rounded transparent style={styles.roundButton}
                                        onPress={()=>Linking.openURL(`tel:${this.state.place.formatted_phone_number}`)}>
                                        <Icon type={'FontAwesome5'} name={'phone'} style={styles.buttonIcon}></Icon>
                                        <Label style={{fontSize: 12}}>Call</Label>
                                    </Button> : null
                            }
                            {
                                this.state.place.website != null ? 
                                    <Button small rounded transparent style={styles.roundButton}
                                        onPress={()=>Linking.openURL(`${this.state.place.website}`)}>
                                        <Icon type={'FontAwesome5'} name={'globe'} style={styles.buttonIcon}></Icon>
                                        <Label style={{fontSize: 12}}>Website</Label>
                                    </Button> : null
                            }
                            {
                                <Button small rounded transparent style={styles.roundButton}
                                    onPress={()=>{alert("not implemented")}}>
                                    <Icon type={'FontAwesome5'} name={'share'} style={styles.buttonIcon}></Icon>
                                    <Label style={{fontSize: 12}}>Share</Label>
                                </Button>
                            }
                            {/* <Button small rounded transparent style={styles.roundButton}
                                onPress={()=>{alert("not implemented")}}>
                                <Icon type={'FontAwesome5'} name={'star'} style={styles.buttonIcon}></Icon>
                                <Label style={{fontSize: 12}}>Favorite</Label>
                            </Button> */}
                        </ScrollView>
                    </View>
                    {       
                        this.state.items.length > 0 ?       
                            <ScrollView>
                                <List style={styles.list}>
                                    {
                                        this.state.items.map((item: reviewSummary, idx: number)=> 
                                            <ListItem avatar key={idx} style={styles.listItem}>
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
                                                    <Text style={{position: 'absolute', right: '20%', top: 10 }} note>{ item.date }</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                                        <Button style={styles.reviewActionBtn} transparent onPress={()=>{}}>
                                                            <Icon style={styles.reviewActionIcon} type={'FontAwesome5'} name={'thumbs-up'}/>
                                                            <Label style={{fontSize: 10}}>Thank</Label>
                                                        </Button>
                                                        <Button style={styles.reviewActionBtn} transparent onPress={()=>{}}>
                                                            <Icon style={styles.reviewNegativeActionIcon} type={'FontAwesome5'} name={'flag'}/>
                                                            <Label style={{fontSize: 10}}>Report</Label>
                                                        </Button>
                                                    </View>
                                                </Right>
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </ScrollView>
                        :
                        <View style={styles.noReviewConatiner}>
                            <Title>Hmm... No reviews from your network yet.</Title>
                            <Text>Be the first to write one!</Text>
                        </View>
                    }
                </View>
            }
            <WriteReview 
                place={this.state.place}
                showModal={this.state.showReviewModal} 
                onDismissModal={this.onDismissModal.bind(this)}/>
            <ReviewComplete 
                showModal={this.state.showReviewCompleteModal} 
                onDismissModal={this.onDismissReviewCompleteModal.bind(this)}/>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('screen').height
    },
    titleView: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginTop: 10
    },
    title: {
        maxWidth: 250,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    starTouchable: {
        width: 120, 
        alignSelf: 'center'
    },
    starsView: {
        marginTop: 5,
        marginBottom: 10,
        alignSelf: 'center'
    },
    buttonContainer: {
        margin: 5
    },
    roundButton: {
        margin: 5,
        width: 80,
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50,
        flexDirection: 'column'
    },
    buttonIcon:{
        color: theme.PRIMARY_COLOR
    },
    disabledButton: {
        margin: 5,
        width: 80,
        borderWidth: 1,
        borderColor: theme.PRIMARY_COLOR,
        height: 50,
        flexDirection: 'column',
        opacity: .5
    },
    disabledIcon: {
        color: theme.PRIMARY_COLOR
    },
    list: {
        paddingRight: 5
    },
    listItem: {
        // minHeight: 100
    },
    reviewActionBtn:{
        flexDirection: 'column',
        alignSelf: 'center'
    },
    reviewActionIcon:{
        color: theme.PRIMARY_COLOR,
        fontSize: 20
    },
    reviewNegativeActionIcon: {
        color: theme.DANGER_COLOR,
        fontSize: 20
    },
    noReviewConatiner: {
        minHeight: 200,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    badge: {
        alignSelf: 'center',
        marginBottom: 5
    },
    badgeText: {
        fontSize: 14
    }
  });