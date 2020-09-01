import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
import { getGooglePlaceById } from '../../services/googlePlaceApiService';
import { fullApiPlace } from '../../models/place';
import _indexOf from 'lodash/indexOf';

export default class PlaceDetails extends React.Component<
    { placeId: string, toggleSummaryModal: Function },
    { 
        items: Array<reviewSummary>, 
        showReviewModal: boolean, 
        isLoading: boolean,
        place: fullApiPlace,
        disableEdit: boolean
    }> {

    state = {
        isLoading: true,
        showReviewModal: false,
        items: [],
        place: {},
        disableEdit: true
    }


    componentDidMount(){
        this.load()
            .catch(error => console.error(error));
    }

    async load(){
        const reviews = await FirebaseService.getReviews(this.props.placeId)
        const place = await getGooglePlaceById(this.props.placeId);
        const userReviews = await FirebaseService.getUserReviewList();

        this.setState({
            showReviewModal: false,
            items: reviews,
            place: place,
            isLoading: false,
            disableEdit: _indexOf(userReviews, place.place_id) > -1
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
                    <View style={styles.header}>
                        <Button transparent onPress={this.onDismissPanel.bind(this)}>
                            <Icon type="FontAwesome" name="close"></Icon>
                        </Button>
                        <Text style={styles.title}>{this.state.place.name}</Text>
                        <Button transparent onPress={this.onPressWriteReview.bind(this)} disabled={this.state.disableEdit}>
                            <Icon type="FontAwesome" name="edit"></Icon>
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
                                                <Thumbnail source={{ uri: item.img}} defaultSource={require('../../assets/images/profile.png')} />
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
    header: {
        padding: 5,
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    dismissButton: {
    },
    editButton: {
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 10
    },
    noReviewConatiner: {
        width: '100%',
        marginTop: 100,
        // backgroundColor: '#DCDCDC',
        alignItems: 'center'
    }
  });