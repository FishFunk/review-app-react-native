import { Text, View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import ReviewStars from './ReviewStars';
import YelpReviewStars from './YelpReviewStars';

export default class StarRatingListItem extends Component<{
    pricing?: number,
    noBullCount?: number,
    noBullRating?: number,
    googleRating?: number,
    googleCount?: number,
    yelpRating?: number,
    yelpCount?: number
},{}>{

    styles = StyleSheet.create({
        label: {
            fontSize: 10,
            width: 42,
            alignSelf: 'center'
        },
        flexRow: {
            flexDirection: 'row',
            width: '80%'
        },
        starRow: {
            marginTop: 4,
            flexDirection: 'row'
        },
        yelpRow: {
            flexDirection: 'row',
            marginTop: 6
        },
        subTextView: {
            alignSelf: 'center'
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
            yelpCount } = this.props;

        return <View style={this.props.width ? { width: this.props.width } : {}}>
            <View style={{height: 5}}></View>
            <View style={this.styles.starRow}>
                <View style={this.styles.flexRow}>
                    <Text style={this.styles.label}>NoBull</Text>
                    <View>
                        <ReviewStars rating={noBullRating || 0} fontSize={16} />
                    </View>
                </View> 
                <View style={this.styles.subTextView}>
                    <Text style={this.styles.subText}>({noBullCount || 0})</Text>
                </View>
            </View>
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