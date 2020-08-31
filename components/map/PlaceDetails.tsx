import React from 'react';
import { View, StyleSheet, GestureResponderHandlers, ScrollView } from 'react-native';
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
    Header,
    Title
} from 'native-base';
import ReviewStars from '../unused/ReviewStars';
import FirebaseService from '../../services/firebaseService';
import { review } from '../../models/reviews';
import theme from '../../styles/theme';

export default class PlaceDetails extends React.Component<
    {placeId: string, dragHandler: GestureResponderHandlers},
    {items: Array<review>}> {

    state = {
        items: []
    }


    componentDidUpdate(prevProps: any){
        FirebaseService.getReviews(this.props.placeId)
            .then((reviews: Array<review>)=>{
                this.setState({ items: reviews });
            })
            .catch(error => console.error(error));
    }

    onPressWriteReview(){
        
    }

    onDismiss(){

    }

    render() {
        return (
        <View>
            <View style={styles.draggable} {...this.props.dragHandler}>
                <Button transparent onPress={this.onDismiss}>
                    <Icon type="FontAwesome" name="close"></Icon>
                </Button>
                <Text style={styles.title}>Some Place</Text>
                <Button transparent onPress={this.onPressWriteReview}>
                    <Icon type="FontAwesome" name="edit"></Icon>
                </Button>
            </View>
            <ScrollView>
                <List style={styles.list}>
                    {
                        this.state.items.map((item: review)=> 
                            <ListItem avatar style={styles.listItem}>
                                <Left>
                                    <Thumbnail source={{ uri: item.img || `https://cdn2.vectorstock.com/i/1000x1000/23/81/default-avatar-profile-icon-vector-18942381.jpg` }} />
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
        </View>)
    }
}

const styles = StyleSheet.create({
    list: {
        padding: 5
    },
    listItem: {
        padding: 5
    },
    draggable: {
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