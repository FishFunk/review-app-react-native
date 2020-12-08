import { Text, View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import ReviewDollars from './ReviewDollars';
import ReviewStars from './ReviewStars';
import YelpReviewStars from './YelpReviewStars';

export default class StarRatingListItem extends Component<{
    pricing?: number,
    noBullRating?: number,
    googleRating?: number,
    yelpRating?: number,
    width?: number | string
},{}>{

    styles = StyleSheet.create({
        label: {
            fontSize: 8,
            alignSelf: 'center'
        },
        starRow: {
            marginTop: 2,
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'space-between'
        },
        yelpRow: {
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'space-between',
            marginTop: 4
        }
    });

    render(){
        const { showLabels, noBullRating, googleRating, yelpRating, pricing } = this.props;

        return <View style={this.props.width ? { width: this.props.width } : {}}>
            { noBullRating != null ? 
                <View style={this.styles.starRow}>
                    <Text style={this.styles.label}>NoBull</Text>
                    <ReviewStars rating={noBullRating} fontSize={18} />
                    {
                        pricing ?
                            <View style={{position: 'absolute', flexDirection: 'row', top: -2, right: -50}}>
                                <Text style={{ fontFamily: theme.fontLight }}>(</Text>
                                    <ReviewDollars rating={pricing} fontSize={14} style={{alignSelf: 'center'}}/>
                                <Text style={{ fontFamily: theme.fontLight }}>)</Text>
                            </View>: null
                    }
                </View> : null }

            { googleRating != null ? 
                <View style={this.styles.starRow}>
                    <Text style={this.styles.label}>Google</Text>
                    <ReviewStars rating={googleRating} fontSize={18} color={theme.googleRed} />
                </View> : null }

            { yelpRating != null ? 
                <View style={this.styles.yelpRow}>
                    <Text style={this.styles.label}>Yelp</Text>
                    <YelpReviewStars rating={yelpRating} />
                </View> : null }
        </View>
    }
}