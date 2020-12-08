import React, { Component } from "react";
import { View, StyleSheet  } from "react-native";
import { Icon } from 'native-base';
import theme from "../../styles/theme";

class ReviewStars extends Component<{ rating: number, fontSize: number, color?: string, style?: any }> {

  styles = StyleSheet.create({
    star: {
      fontSize: this.props.fontSize,
      // paddingLeft: 1,
      // paddingRight: 1,
      color: this.props.color ? this.props.color : theme.STAR_COLOR
    }
  });

  FullStar = (key: any) => (
    <Icon       
      style={this.styles.star}
      key={key} 
      name="ios-star"/>
  );

  HalfStar = (key: any) => (
    <Icon
      style={this.styles.star}
      key={key}
      name="ios-star-half"
    />
  );

  EmptyStar = (key: any) => (
    <Icon
      style={this.styles.star}
      key={key}
      name="ios-star-outline"
    />
  );
  render() {
    const { rating } = this.props;
    const fullStarCount = Math.floor(rating);
    let addHalfStar = rating % 1 > 0.4;

    let stars = [];
    for(let i = 1; i <= 5; i++){
      if(i <= fullStarCount){
        stars.push(this.FullStar(i));
      } else if (addHalfStar){
        stars.push(this.HalfStar(i));
        addHalfStar = false;
      } else {
        stars.push(this.EmptyStar(i));
      }
    }

    return <View style={{ flexDirection: "row", ...this.props.style }}>{stars}</View>;
  }
}

export default ReviewStars;