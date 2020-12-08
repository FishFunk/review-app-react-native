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
    googleCount?: number,
    yelpRating?: number,
    yelpCount?: number,
    width?: number | string
},{}>{

    styles = StyleSheet.create({
        label: {
            fontSize: 8,
            width: 40,
            alignSelf: 'center'
        },
        flexRow: {
            flexDirection: 'row'
        },
        starRow: {
            marginTop: 2,
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        yelpRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4
        },
        subTextView: {
            alignSelf: 'center',
            flexDirection: 'row'
        },
        subText: {
            alignSelf: 'center',
            fontFamily: theme.fontLight,
            fontSize: 10
        },
        paren: {
            fontFamily: theme.fontLight,
            fontSize: 14
        }
    });

    render(){
        const { noBullRating, googleRating, googleCount, yelpRating, yelpCount, pricing } = this.props;

        return <View style={this.props.width ? { width: this.props.width } : {}}>
            { noBullRating != null ? 
                <View style={this.styles.starRow}>
                    <View style={this.styles.flexRow}>
                        <Text style={this.styles.label}>NoBull</Text>
                        <ReviewStars rating={noBullRating} fontSize={18} />
                    </View>   
                    {
                        pricing ?
                            <View style={this.styles.subTextView}>
                                <Text style={this.styles.paren}>(</Text>
                                    <ReviewDollars rating={pricing} fontSize={14} style={{alignSelf: 'center'}}/>
                                <Text style={this.styles.paren}>)</Text>
                            </View>: null
                    }
                </View> : null }

            { googleRating != null ? 
                <View style={this.styles.starRow}>
                    <View style={this.styles.flexRow}>
                        <Text style={this.styles.label}>Google</Text>
                        <ReviewStars rating={googleRating} fontSize={18} color={theme.googleRed} />
                    </View>
                    {
                        googleCount ? 
                            <View style={this.styles.subTextView}>
                                <Text style={this.styles.subText}>({googleCount})</Text>
                            </View> : null
                    }
                </View> : null }

            { yelpRating != null ? 
                <View style={this.styles.yelpRow}>
                    <View style={this.styles.flexRow}>
                        <Text style={this.styles.label}>Yelp</Text>
                        <YelpReviewStars rating={yelpRating} />
                    </View>
                    { 
                        yelpCount? 
                            <View style={this.styles.subTextView}>
                                <Text style={this.styles.subText}>({yelpCount})</Text>
                            </View> : null
                    }
                </View> : null }
        </View>
    }
}