import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    List, 
    ListItem, 
    Text, 
    Body, 
    Left, 
    Right, 
    Thumbnail
} from 'native-base';
import ReviewStars from '../unused/ReviewStars';
import theme from '../../styles/theme';

export default class PlaceDetails extends React.Component {

    state = {
        items: [
            {
                img: 'https://cdn2.vectorstock.com/i/1000x1000/23/81/default-avatar-profile-icon-vector-18942381.jpg',
                name: 'Jack Russell',
                comments: 'AMAZING!!!',
                rating: 5,
                date: '03/05/2020'
            },
            {
                img: 'https://cdn2.vectorstock.com/i/1000x1000/23/81/default-avatar-profile-icon-vector-18942381.jpg',
                name: 'Golden Retriever',
                comments: 'Bathroom was dirty but food was great.',
                rating: 4,
                date: '01/15/2020'
            },
            {
                img: 'https://cdn2.vectorstock.com/i/1000x1000/23/81/default-avatar-profile-icon-vector-18942381.jpg',
                name: 'Australian Shepherd',
                comments: 'Pretty good, nice atmosphere.',
                rating: 3.5,
                date: '07/22/2019'
            }
        ]
    }
    render() {
        return (
        <View>
            <List style={styles.list}>
                {
                    this.state.items.map((item)=> 
                        <ListItem avatar style={styles.listItem}>
                            <Left>
                                <Thumbnail source={{ uri: item.img }} />
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
        </View>)
    }
}

const styles = StyleSheet.create({
    list: {
        padding: 5
    },
    listItem: {
        padding: 5
    }
  });