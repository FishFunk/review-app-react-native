import { Text, View } from 'native-base';
import React, { Component } from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import ReviewStars from './ReviewStars';
import YelpReviewStars from './YelpReviewStars';
import yelpLogo from '../../assets/images/yelp_logo/yelp_logo_transparent.png';

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
            width: '100%'
        },
        starRow: {
            marginTop: 4,
            flexDirection: 'row',
            width: '100%'
        },
        yelpRow: {
            flexDirection: 'row',
            marginTop: 6,
            width: '100%'
        },
        subTextView: {
            justifyContent: 'flex-end',
            alignSelf: 'flex-end'
        },
        subText: {
            alignSelf: 'flex-end',
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

        return <View style={{width: 130}}>
            <View style={this.styles.starRow}>
                <View style={this.styles.flexRow}>
                    <Text style={this.styles.label}>NoBull</Text>
                    <ReviewStars rating={noBullRating || 0} fontSize={16} />
                </View> 
                <View style={this.styles.subTextView}>
                    <Text style={this.styles.subText}>({noBullCount || 0})</Text>
                </View>
            </View>
            <View style={this.styles.starRow}>
                <View style={this.styles.flexRow}>
                    <Text style={this.styles.label}>Google</Text>
                    <ReviewStars rating={googleRating || 0} fontSize={16} color={theme.googleRed} />
                </View>
                <View style={this.styles.subTextView}>
                    <Text style={this.styles.subText}>({googleCount || 0})</Text>
                </View>
            </View>
            <View style={this.styles.yelpRow}>
                {
                    // Need to use Text component for images to be rendered inside map callout on android
                    Platform.OS === 'android' ? 
                    <View style={this.styles.flexRow}>
                            <Text style={{width: 42}}>
                                <Image
                                    style={{ width: 30, height: 15 }}
                                    source={yelpLogo}
                                />
                            </Text>
                            <YelpReviewStars rating={yelpRating || 0} useTextWrapper={true}/>
                    </View>
                    :
                    <View style={this.styles.flexRow}>
                        <View style={{width: 42}}>
                            <Image
                                style={{ width: 30, height: 15 }}
                                source={yelpLogo}
                            />
                        </View>
                        <YelpReviewStars rating={yelpRating || 0} useTextWrapper={false}/>
                    </View>
                }
                <View style={this.styles.subTextView}>
                    <Text style={this.styles.subText}>({yelpCount || 0})</Text>
                </View>
            </View>
    </View>
    }
}