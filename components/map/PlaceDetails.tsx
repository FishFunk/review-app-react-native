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
    Spinner,
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

export default class PlaceDetails extends React.Component<
    { 
        apiKey: string, 
        placeId: string, 
        toggleSummaryModal: Function
    },
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
        const place = await getGooglePlaceById(this.props.apiKey, this.props.placeId);
        let photoUrls = []

        if(place && place.photos){
            // prefetch up to 3 photos
            for(let i=0; i<3; i++){
                if(place.photos[i]){
                    const url = getPhotoUrl(this.props.apiKey, place.photos[i].photo_reference);
                    await Image.prefetch(url);
                    photoUrls.push(url);
                }
            }
        }

        const reviewState = await this.getReviewState();

        this.setState({
            ...reviewState,
            showReviewModal: false,
            place: place,
            photoUrls: photoUrls,
            isLoading: false
        });
    }

    async getReviewState(){
        // TODO: Filter reviews by user followers
        const userId = FirebaseService.getCurrentUserId();
        const reviews = await FirebaseService.getReviewSummaries(this.props.placeId)
        let total = 0;
        let disableEditing = false;
        if(reviews && reviews.length > 0){
            let sum = 0;
            for(let r of reviews){
                sum += r.avg_rating;
                if(r.reviewer_id === userId){
                    disableEditing = true;
                }
            }
            total = sum/reviews.length;
        }

        return { items: reviews, total: total, disableEdit: disableEditing };
    }

    onPressWriteReview(){
        this.setState({ showReviewModal: true });
    }

    onDismissPanel(){
        this.props.toggleSummaryModal(false);
    }

    async onDismissModal(){
        this.setState({ isLoading: true, showReviewModal: false });
        const newReviewState = await this.getReviewState();
        this.setState({ ...newReviewState, isLoading: false });
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
                this.state.isLoading ?
                <Spinner color={theme.PRIMARY_COLOR} /> :
                <View style={{flex: 1}}>
                    <View style={styles.titleView}>
                        <Text style={styles.title}>{this.state.place.name}</Text>
                        <TouchableOpacity 
                            style={styles.starsView} 
                            onPress={this.onPressWriteReview.bind(this)}
                            disabled={this.state.disableEdit}>
                            <ReviewStars rating={this.state.total} fontSize={22}/>
                        </TouchableOpacity>
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
                            horizontal 
                            showsHorizontalScrollIndicator={false}>
                            {
                                <Button small rounded transparent style={styles.roundButton}
                                    onPress={this.onOpenMaps.bind(this)}>
                                    <Icon type={'FontAwesome5'} name={'directions'} style={styles.buttonIcon}></Icon>
                                    <Label style={{fontSize: 12}}>Directions</Label>
                                </Button>
                            }
                            {
                                <Button small rounded transparent style={styles.roundButton}
                                    onPress={()=>{alert("not implemented")}}>
                                    <Icon type={'FontAwesome5'} name={'star'} style={styles.buttonIcon}></Icon>
                                    <Label style={{fontSize: 12}}>Favorite</Label>
                                </Button>
                            }
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

                            <Button small rounded transparent 
                                style={this.state.disableEdit ? styles.disabledButton : styles.roundButton} 
                                onPress={this.onPressWriteReview.bind(this)}
                                disabled={this.state.disableEdit}>
                                <Icon type={'FontAwesome5'} name={'edit'} 
                                    style={this.state.disableEdit ? styles.disabledIcon : styles.buttonIcon}></Icon>
                                <Label style={{fontSize: 12}}>Review</Label>
                            </Button>
                        </ScrollView>
                    </View>
                    {       
                        this.state.items.length > 0 ?       
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
                        :
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
                onReviewSubmit={this.props.onReviewSubmit}
                onDismissModal={this.onDismissModal.bind(this)}/>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('screen').height - 100
    },
    titleView: {
        flexDirection: 'column', 
        justifyContent: 'center',
        marginTop: 10
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center'
    },
    starsView: {
        marginTop: 5,
        alignSelf: 'center',
        marginBottom: 5
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