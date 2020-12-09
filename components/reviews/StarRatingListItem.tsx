import { Text, View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import ReviewDollars from './ReviewDollars';
import ReviewStars from './ReviewStars';
import YelpReviewStars from './YelpReviewStars';

export default class StarRatingListItem extends Component<{
    pricing?: number,
    noBullCount?: number,
    noBullRating?: number,
    googleRating?: number,
    googleCount?: number,
    yelpRating?: number,
    yelpCount?: number,
    width?: number | string
},{}>{

    styles = StyleSheet.create({
        label: {
            fontSize: 10,
            width: 42,
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
        }
    });

    render(){
        const { 
            noBullRating, 
            noBullCount, 
            googleRating, 
            googleCount, 
            yelpRating, 
            yelpCount, 
            pricing } = this.props;

        return <View style={this.props.width ? { width: this.props.width } : {}}>
            <View style={{height: 5}}></View>
            <View style={this.styles.starRow}>
                <View style={this.styles.flexRow}>
                    <Text style={this.styles.label}>NoBull</Text>
                    <View>
                        <ReviewDollars rating={pricing || 0} fontSize={12} style={{marginLeft: 2}}/>
                        <ReviewStars rating={noBullRating || 0} fontSize={16} />
                    </View>
                </View> 
                <View style={this.styles.subTextView}>
                    <Text style={this.styles.subText}>({noBullCount || 0})</Text>
                </View>
            </View>
            <View style={{height: 5}}></View>
            { googleRating != null ? 
                <View style={this.styles.starRow}>
                    <View style={this.styles.flexRow}>
                        <Text style={this.styles.label}>Google</Text>
                        <ReviewStars rating={googleRating} fontSize={16} color={theme.googleRed} />
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