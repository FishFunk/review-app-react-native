import React, { Component } from "react";
import { Image } from 'react-native';

export default class YelpReviewStars extends Component<{ rating: number }> {

  render() {
    const { rating } = this.props;
    let asset;

    if(rating < 1.5){
      asset = require('../../assets/images/yelp_stars/small/small_0.png');
    }
    
    if(rating >= 1.5 && rating < 2){
      asset = require('../../assets/images/yelp_stars/small/small_1_half.png');
    }

    if(rating >= 2 && rating < 2.5){
      asset = require('../../assets/images/yelp_stars/small/small_2.png');
    }

    if(rating >= 2.5 && rating < 3){
      asset = require('../../assets/images/yelp_stars/small/small_2_half.png');
    }

    if(rating >= 3 && rating < 3.5){
      asset = require('../../assets/images/yelp_stars/small/small_3.png');
    }

    if(rating >= 3.5 && rating < 4){
      asset = require('../../assets/images/yelp_stars/small/small_3_half.png');
    }

    if(rating >= 4 && rating < 4.5){
      asset = require('../../assets/images/yelp_stars/small/small_4.png');
    }

    if(rating >= 4.5 && rating < 5){
      asset = require('../../assets/images/yelp_stars/small/small_4_half.png');
    }

    if(rating === 5){
      asset = require('../../assets/images/yelp_stars/small/small_5.png');
    }

    return <Image source={asset} />;
  }
}