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
    Spinner
} from 'native-base';
import ReviewStars from '../reviews/ReviewStars';
import FirebaseService from '../../services/firebaseService';
import { review } from '../../models/reviews';
import theme from '../../styles/theme';
import WriteReview from '../reviews/WriteReview';

export default class PlaceDetails extends React.Component<
    { placeId: string, toggleSummaryModal: Function },
    { items: Array<review>, showReviewModal: boolean, isLoading: boolean }> {

    state = {
        isLoading: true,
        showReviewModal: false,
        items: []
    }


    componentDidMount(){
        FirebaseService.getReviews(this.props.placeId)
            .then((reviews: Array<review>)=>{
                this.setState({ 
                    items: reviews, 
                    isLoading: false });
            })
            .catch(error => console.error(error));
    }

    onPressWriteReview(){
        this.setState({ showReviewModal: true });
    }

    onDismissPanel(){
        this.props.toggleSummaryModal(false);
    }

    onDismissModal(){
        this.setState({ showReviewModal: false });
    }

    render() {
        return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Button transparent onPress={this.onDismissPanel.bind(this)}>
                    <Icon type="FontAwesome" name="close"></Icon>
                </Button>
                <Text style={styles.title}>Some Place</Text>
                <Button transparent onPress={this.onPressWriteReview.bind(this)}>
                    <Icon type="FontAwesome" name="edit"></Icon>
                </Button>
            </View>
            {
                this.state.isLoading ?
                <Spinner color={theme.PRIMARY_COLOR} /> :
                <ScrollView>
                    <List style={styles.list}>
                        {
                            this.state.items.map((item: review, idx: number)=> 
                                <ListItem avatar key={idx} style={styles.listItem}>
                                    <Left>
                                        <Thumbnail source={{ uri: item.img}} defaultSource={require('../../assets/images/profile.png')} />
                                    </Left>
                                    <Body>
                                        <ReviewStars rating={item.rating} />
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
            }
            <WriteReview 
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
    }
  });