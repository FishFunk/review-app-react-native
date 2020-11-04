import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
    List, 
    ListItem, 
    Text, 
    Body, 
    Left, 
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
import { getReviewAverages } from '../../services/utils';
import _find from 'lodash/find';
import SpinnerContainer from '../SpinnerContainer';
import ReviewComplete from '../reviews/ReviewComplete';
import ReviewDollars from '../reviews/ReviewDollars';
import ReportModal from '../ReportModal';
import HorizontalButtonList from '../HorizontalButtonList';

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
        showReportModal: boolean,
        reportReview: reviewSummary,
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean,
        photoUrls: Array<string>,
        rating: number,
        pricing: number
    }> {

    initialPlace: fullApiPlace = {};
    initialReportReview: any = {};

    state = {
        isLoading: true,
        showReviewModal: false,
        showReviewCompleteModal: false,
        showReportModal: false,
        reportReview: this.initialReportReview,
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
                    // await Image.prefetch(url);
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
        const reviews = await FirebaseService.getReviewSummaries(this.props.placeId);
        const averages = getReviewAverages(reviews);

        let disableEditing = _find(reviews, (r) => r.reviewer_id === userId) != null;

        return { 
            items: reviews, 
            rating: averages.avgRating, 
            pricing: averages.avgPrice, 
            disableEdit: disableEditing };
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

    onReportReview(reviewSummary: reviewSummary){
        this.setState({ reportReview: reviewSummary, showReportModal: true });
    }

    async onThankReview(reviewSummary: reviewSummary){
        this.setState({ isLoading: true });
        await FirebaseService.submitReviewThankYou(reviewSummary);
        let newState = await this.getReviewState();
        this.setState({ isLoading: false, items: newState.items });
    }

    async onDismissReportModal(){
        this.setState({ isLoading: true });
        let newState = await this.getReviewState();
        this.setState({ isLoading: false, showReportModal: false, items: newState.items });
    }

    renderReviewSummaries(){
        const { items: reviewSummaries } = this.state;
        let elements = [];

        for (let review of reviewSummaries){
            const disableThanks = _find(review.thanks, (t) => t.user_id === FirebaseService.getCurrentUserId());
            const disableReport = _find(review.reports, (r) => r.reporter_id === FirebaseService.getCurrentUserId());
            elements.push(<ListItem avatar key={review.review_key} style={styles.listItem}>
                <Left>
                    <Thumbnail 
                        style={{width: 50, height: 50, alignSelf: 'center'}}
                        source={{ uri: review.img }} 
                        defaultSource={require('../../assets/images/profile.png')} />
                </Left>
                <Body style={{transform: [{ translateX: -5 }]}}>
                    <ReviewStars rating={review.avg_rating} fontSize={18} />
                    <Text>{review.reviewer_id === FirebaseService.getCurrentUserId() ? 'You' : review.name}</Text>
                    <Text note>{review.comments}</Text>
                    <Text note style={{position: 'absolute', top: 10, right: 5, fontSize: 12 }}>{ review.date }</Text>
                    {review.reviewer_id !== FirebaseService.getCurrentUserId() ?
                        <View style={{ 
                            marginRight: 5,
                            flexDirection: 'row',
                            alignSelf: 'flex-end'}}>
                            <Button 
                                disabled={disableThanks}
                                transparent
                                style={disableThanks ? styles.reviewActionBtnDisabled : styles.reviewActionBtn} 
                                onPress={this.onThankReview.bind(this, review)}>
                                <Icon style={styles.reviewActionIcon} type={'FontAwesome5'} name={'thumbs-up'}/>
                                <Label style={{fontSize: 8}}>{disableThanks ? 'Thanked' : 'Thank'}</Label>
                            </Button>
                            <Button 
                                disabled={disableReport}
                                transparent
                                style={disableReport ? styles.reviewActionBtnDisabled : styles.reviewActionBtn} 
                                onPress={this.onReportReview.bind(this, review)}>
                                <Icon style={styles.reviewNegativeActionIcon} type={'FontAwesome5'} name={'flag'}/>
                                <Label style={{fontSize: 8}}>{disableReport ? 'Reported' : 'Report'}</Label>
                            </Button>
                        </View> : null}
                </Body>
            </ListItem>
            );
        }

        return elements;
    }

    render() {
        return (
        <View style={styles.container}>
            <View style={styles.titleView}>
                <View>
                    <Button 
                        transparent
                        style={{ width: 50, height: 50}}
                        onPress={this.props.navigation.goBack}>
                        <Icon 
                            style={{color: theme.PRIMARY_COLOR}}
                            name={'arrow-left'} 
                            type={'FontAwesome5'}/>
                    </Button>
                </View>
                <View>
                    <Text style={styles.title}>{this.state.place.name}</Text>
                    <TouchableOpacity 
                        containerStyle={styles.starTouchable}
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
            <HorizontalButtonList 
                disableEdit={this.state.disableEdit}
                place={this.state.place}
                onPressWriteReview={this.onPressWriteReview.bind(this)}/>
            {       
                this.state.items.length > 0 ?
                    <ScrollView style={{flex: 1}}>
                        <List>
                            {
                                this.renderReviewSummaries()
                            }
                        </List>
                    </ScrollView>
                    :
                    <View style={styles.noReviewConatiner}>
                        <Title>Hmm... No reviews from your network yet.</Title>
                        <Text>Be the first to write one!</Text>
                    </View>
            }
            <WriteReview 
                place={this.state.place}
                showModal={this.state.showReviewModal} 
                onDismissModal={this.onDismissModal.bind(this)}/>

            <ReviewComplete 
                showModal={this.state.showReviewCompleteModal} 
                onDismissModal={this.onDismissReviewCompleteModal.bind(this)}/>

            <ReportModal 
                showModal={this.state.showReportModal} 
                onDismissModal={this.onDismissReportModal.bind(this)} 
                review={this.state.reportReview}/>     
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
    list: {
        
    },
    listItem: {

    },
    reviewActionBtn:{
        flexDirection: 'column',
        alignSelf: 'center'
    },
    reviewActionBtnDisabled: {
        flexDirection: 'column',
        alignSelf: 'center',
        opacity: 0.5
    },
    reviewActionIcon:{
        color: theme.PRIMARY_COLOR,
        fontSize: 12
    },
    reviewNegativeActionIcon: {
        color: theme.DANGER_COLOR,
        fontSize: 12
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