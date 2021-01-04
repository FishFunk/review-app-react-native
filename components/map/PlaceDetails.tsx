import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { 
    ListItem, 
    Text, 
    Body, 
    Left, 
    Button,
    Icon,
    Badge,
    Label
} from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import FirebaseService from '../../services/firebaseService';
import { reviewSummary } from '../../models/reviews';
import theme from '../../styles/theme';
import WriteReview from '../reviews/WriteReview';
import { getPhotoUrl } from '../../services/googlePlaceApiService';
import _indexOf from 'lodash/indexOf';
import HorizontalPhotoList from '../HorizontalPhotoList';
import openMap from 'react-native-open-maps';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Utils from '../../services/utils';
import _find from 'lodash/find';
import SpinnerContainer from '../SpinnerContainer';
import ReviewComplete from '../reviews/ReviewComplete';
import ReviewDollars from '../reviews/ReviewDollars';
import ReportModal from '../ReportModal';
import HorizontalButtonList from '../HorizontalButtonList';
import ListAvatar from '../profile/ListAvatar';
import YelpReviewStars from '../reviews/YelpReviewStars';
import { placeMarkerData } from '../../models/place';

export default class PlaceDetails extends React.Component<
    { 
        navigation: any,
        apiKey: string, 
        placeSummary: placeMarkerData, 
        toggleSummaryModal: Function
    },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        showReviewCompleteModal: boolean,
        showReportModal: boolean,
        editReview: reviewSummary,
        reportReview: reviewSummary,
        isLoading: boolean,
        disableEdit: boolean,
        photoUrls: Array<string>,
        reloadMarkers: boolean,
        openInfo: { open_now: boolean, message: string } | null,
        pricing: number,
        rating: number
    }> {

    // Initalize complex state values to remove type warnings
    initialReportReview: any = {};
    initialOpenInfo: any = {};
    initialEditReview: any = null;

    state = {
        isLoading: true,
        showReviewModal: false,
        showReviewCompleteModal: false,
        showReportModal: false,
        editReview: this.initialEditReview,
        reportReview: this.initialReportReview,
        items: new Array<reviewSummary>(),
        pricing: 0,
        rating: 0,
        photoUrls: new Array<string>(),
        disableEdit: true,
        reloadMarkers: false,
        openInfo: this.initialOpenInfo
    }


    componentDidMount(){
        this.load()
            .catch(error => FirebaseService.logError(error, 'PlaceDetails - componentDidMount'));
    }

    async load(){
        const { apiKey, placeSummary } = this.props;
        const openInfo = Utils.checkForOpenCloseHours(placeSummary.opening_hours);
        this.setState({ openInfo: openInfo });

        let photoUrls = []
        if(placeSummary.photos){
            // prefetch up to 3 photos
            for(let i=0; i<3; i++){
                if(placeSummary.photos[i]){
                    const url = getPhotoUrl(apiKey, placeSummary.photos[i].photo_reference);
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
        const reviews = await FirebaseService.getReviewSummaries(this.props.placeSummary.placeId);
        const averages = Utils.getReviewAverages(reviews);

        let disableEditing = _find(reviews, (r) => r.reviewer_id === userId) != null;

        return { items: reviews, disableEdit: disableEditing, pricing: averages.avgPrice, rating: averages.avgRating };
    }

    onPressWriteReview(){
        this.setState({ showReviewModal: true });
    }

    onDismissPanel(){
        this.props.toggleSummaryModal(false);
    }

    async onDismissReviewModal(showReviewComplete: boolean){
        if(showReviewComplete){
            // Review submitted - reload detail view and show review confirmation modal
            this.setState({ 
                isLoading: true, 
                showReviewModal: false, 
                showReviewCompleteModal: true });
            const newReviewState = await this.getReviewState();

            this.setState({ ...newReviewState, isLoading: false, reloadMarkers: true });
        } else {
            this.setState({ showReviewModal: false });
        }
    }

    onDismissReviewCompleteModal(){
        this.setState({ showReviewCompleteModal: false });
    }

    onOpenMaps(){
        const { formatted_address, title } = this.props.placeSummary;
        
        openMap({ 
            // latitude: lat,
            // longitude: lng, 
            query: title, 
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

    async onEditReview(reviewSummary: reviewSummary){
        this.setState({ showReviewModal: true, editReview: reviewSummary });
    }

    onNavigateBack(){
        this.props.navigation.navigate('Home', { reloadMarkers: this.state.reloadMarkers })
    }

    renderReviewSummaries(listItem: any){
        const { item: review } = listItem;

        const disableThanks = _find(review.thanks, (t) => t.user_id === FirebaseService.getCurrentUserId()) != null;
        const disableReport = _find(review.reports, (r) => r.reporter_id === FirebaseService.getCurrentUserId()) != null;
        return <ListItem avatar style={styles.listItem}>
            <Left>
                <ListAvatar user_verified={review.user_verified} img={review.img} />
            </Left>
            <Body>
                <Text>{review.reviewer_id === FirebaseService.getCurrentUserId() ? 'You' : review.name}</Text>
                <ReviewStars rating={review.avg_rating} fontSize={18} />
                {
                    review.covid_safe != null ?
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 12, fontFamily: theme.fontLight }}>COVID-19 Safe</Text>
                        {
                            review.covid_safe ?
                                <Icon type={'FontAwesome'} name={'check-circle'} style={{
                                    fontSize: 12, 
                                    alignSelf: 'center', 
                                    color: theme.SECONDARY_COLOR}}></Icon>
                                :
                                <Icon type={'FontAwesome'} name={'times-circle'} 
                                    style={{fontSize: 12, 
                                        alignSelf: 'center', 
                                        color: theme.DANGER_COLOR}}></Icon>
                        }
                    </View> : null
                }
                <Text note>{review.comments}</Text>

                <Text note style={{position: 'absolute', top: 10, right: 5, fontSize: 12 }}>{ review.date }</Text>
                {review.reviewer_id !== FirebaseService.getCurrentUserId() ?
                    <View style={styles.reviewIconContainer}>
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
                    </View> : 
                    <View style={styles.reviewIconContainer}>
                        <Button 
                            transparent
                            style={styles.reviewActionBtn} 
                            onPress={this.onEditReview.bind(this, review)}>
                            <Icon style={styles.reviewActionIcon} type={'FontAwesome5'} name={'edit'}/>
                            <Label style={{fontSize: 8}}>Edit</Label>
                        </Button>
                    </View>}
            </Body>
        </ListItem>;
    }

    render() {
        const { placeSummary } = this.props;

        return (
        <View style={styles.container}>
            <View style={styles.titleView}>
                <View>
                    <Button 
                        transparent
                        style={{ width: 50, height: 50 }}
                        onPress={this.onNavigateBack.bind(this)}>
                        <Icon 
                            style={{color: theme.PRIMARY_COLOR}}
                            name={'arrow-left'} 
                            type={'FontAwesome5'}/>
                    </Button>
                </View>
                <View style={{alignItems: 'center'}}>
                    {
                        placeSummary.business_status === 'CLOSED_TEMPORARILY' ?
                        <Badge style={styles.warningBadge}>
                            <Text style={styles.badgeText}>Closed Temporarily</Text>
                        </Badge> : null
                    }
                    {
                        placeSummary.business_status === 'CLOSED_PERMANENTLY' ?
                        <Badge style={styles.warningBadge}>
                            <Text style={styles.badgeText}>Closed Permanently</Text>
                        </Badge> : null
                    }
                    {
                        this.state.openInfo && this.state.openInfo.open_now === true ?
                            <Badge style={styles.goodBadge}>
                                <Text style={styles.badgeText}>{this.state.openInfo.message ? this.state.openInfo.message : 'Open Now'}</Text>
                            </Badge> : null
                    }
                    {
                        this.state.openInfo && this.state.openInfo.open_now === false ?
                            <Badge style={styles.warningBadge}>
                                <Text style={styles.badgeText}>{this.state.openInfo.message ? this.state.openInfo.message : 'Closed'}</Text>
                            </Badge> : null
                    }
                    <Text style={styles.title}>{placeSummary.title}</Text>
                    <TouchableOpacity 
                        containerStyle={styles.starTouchable}
                        onPress={this.onPressWriteReview.bind(this)}
                        disabled={this.state.disableEdit}>
                        <View style={{alignItems: 'center'}}>
                            <View style={styles.flexRow}>
                                <ReviewStars rating={this.state.rating || 0} fontSize={20} /> 
                                <Text style={styles.reviewCountLabel}>({this.state.items ? this.state.items.length : 0})</Text>
                            </View>
                            <ReviewDollars rating={this.state.pricing || 0} fontSize={16} style={{marginTop: 5}}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.externalReviews}>
                        <View>
                            <View style={styles.flexRow}>
                                <Text style={styles.brandLabel}>Google</Text>
                                <Text style={styles.reviewCountLabel}>({placeSummary.googleCount || 'No data'})</Text>
                            </View>
                            <ReviewStars rating={placeSummary.googleRating || 0} 
                                    fontSize={16} 
                                    color={theme.googleRed} />
                        </View>
                        <View>
                            <View style={{...styles.flexRow, marginBottom: 1}}>
                                <Image
                                    style={{ width: 30, height: 12 }}
                                    source={require('../../assets/images/yelp_logo/yelp_logo_transparent.png')}
                                />
                                <Text style={styles.reviewCountLabel}>({placeSummary.yelpCount || 'No data'})</Text>
                            </View>
                            <YelpReviewStars rating={placeSummary.yelpRating || 0} useTextWrapper={false}/>
                        </View>
                    </View>
                </View>
                <View style={{ width: 50, height: 50 ,justifyContent: 'center'}}>
                    {this.state.isLoading ? <SpinnerContainer /> : null }
                </View>
            </View>
            {
                this.state.photoUrls && this.state.photoUrls.length > 0 ?
                <View style={{alignItems: 'center'}}>
                    <HorizontalPhotoList photoUrls={this.state.photoUrls} />
                </View> : null
            }
            <HorizontalButtonList 
                disableEdit={this.state.disableEdit}
                placeSummary={this.props.placeSummary}
                onPressWriteReview={this.onPressWriteReview.bind(this)}/>
            {
                this.state.items.length > 0 ?
                    <FlatList 
                        keyExtractor={item => item.review_key}
                        data={this.state.items}
                        renderItem={this.renderReviewSummaries.bind(this)}
                    />
                    :
                    <View style={styles.noReviewConatiner}>
                        <Text style={styles.noReviewText}>Nobody you follow has reviewed this place yet.</Text>
                        <Text style={styles.noReviewText}>Be the first to write one or find more reviewers!</Text>
                        <Button 
                            small
                            style={styles.navigationButton}
                            onPress={()=>{this.props.navigation.push('Social')}}>
                            <Text>Find Reviewers</Text>
                        </Button>
                    </View>
            }
            <WriteReview 
                editReview={this.state.editReview}
                placeSummary={this.props.placeSummary}
                showModal={this.state.showReviewModal} 
                onDismissModal={this.onDismissReviewModal.bind(this)}/>

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
    flexRow: {
        flexDirection: 'row'
    },
    titleView: {
        flexDirection: 'row', 
        justifyContent: 'space-between'
    },
    title: {
        maxWidth: 250,
        fontFamily: theme.fontBold,
        fontSize: 18,
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    starTouchable: {
        marginBottom: 4
    },
    listItem: {
        minHeight: 100,
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
    reviewIconContainer: {
        marginRight: 5,
        flexDirection: 'row',
        alignSelf: 'flex-end'
    },
    noReviewConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noReviewText: {
        fontSize: 12,
        lineHeight: 20,
        color: theme.DARK_COLOR,
        textAlign: 'center'
    },
    warningBadge: {
        backgroundColor: theme.DANGER_COLOR,
        alignSelf: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    goodBadge: {
        backgroundColor: theme.PRIMARY_COLOR,
        alignSelf: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    badgeText: {
        fontFamily: theme.fontBold,
        color: theme.LIGHT_COLOR,
        fontSize: 12
    },
    navigationButton: {
        marginTop: 10,
        backgroundColor: theme.PRIMARY_COLOR,
        alignSelf: 'center'
    },
    externalReviews: {
        width: 220,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 4
    },
    brandLabel: {
        fontFamily: theme.fontBold,
        fontSize: 10
    },
    reviewCountLabel: {
        fontSize: 10,
        fontFamily: theme.fontLight,
        alignSelf: 'center',
        marginLeft: 4
    }
  });