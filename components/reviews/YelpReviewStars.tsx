import { Text, View } from "native-base";
import React, { Component } from "react";
import { Image } from 'react-native';

export default class YelpReviewStars 
  extends Component<{ rating: number, useTextWrapper: boolean, size?: 'small' | 'regular', style?: any }> {

  render() {
    const { rating, size, useTextWrapper } = this.props;
    const targetSize = size ? size : 'small';
    let asset;

    if(targetSize === 'small'){
      if(rating < 1.5){
        asset = require(`../../assets/images/yelp_stars/small/small_0.png`);
      }
      
      if(rating >= 1.5 && rating < 2){
        asset = require(`../../assets/images/yelp_stars/small/small_1_half.png`);
      }
  
      if(rating >= 2 && rating < 2.5){
        asset = require(`../../assets/images/yelp_stars/small/small_2.png`);
      }
  
      if(rating >= 2.5 && rating < 3){
        asset = require(`../../assets/images/yelp_stars/small/small_2_half.png`);
      }
  
      if(rating >= 3 && rating < 3.5){
        asset = require(`../../assets/images/yelp_stars/small/small_3.png`);
      }
  
      if(rating >= 3.5 && rating < 4){
        asset = require(`../../assets/images/yelp_stars/small/small_3_half.png`);
      }
  
      if(rating >= 4 && rating < 4.5){
        asset = require(`../../assets/images/yelp_stars/small/small_4.png`);
      }
  
      if(rating >= 4.5 && rating < 5){
        asset = require(`../../assets/images/yelp_stars/small/small_4_half.png`);
      }
  
      if(rating === 5){
        asset = require(`../../assets/images/yelp_stars/small/small_5.png`);
      }
    } else {
      if(rating < 1.5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_0.png`);
      }
      
      if(rating >= 1.5 && rating < 2){
        asset = require(`../../assets/images/yelp_stars/regular/regular_1_half.png`);
      }
  
      if(rating >= 2 && rating < 2.5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_2.png`);
      }
  
      if(rating >= 2.5 && rating < 3){
        asset = require(`../../assets/images/yelp_stars/regular/regular_2_half.png`);
      }
  
      if(rating >= 3 && rating < 3.5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_3.png`);
      }
  
      if(rating >= 3.5 && rating < 4){
        asset = require(`../../assets/images/yelp_stars/regular/regular_3_half.png`);
      }
  
      if(rating >= 4 && rating < 4.5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_4.png`);
      }
  
      if(rating >= 4.5 && rating < 5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_4_half.png`);
      }
  
      if(rating === 5){
        asset = require(`../../assets/images/yelp_stars/regular/regular_5.png`);
      }
    }
    

    return <View style={ this.props.style? { ...this.props.style } : {} }>
            {
              useTextWrapper ? <Text style={{flex: 1}}><Image source={asset}/></Text> : <Image source={asset}/>
            }
          </View>;
  }
}