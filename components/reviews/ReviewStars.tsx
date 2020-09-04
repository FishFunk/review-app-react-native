import React, { Component } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Icon } from 'native-base';
import theme from "../../styles/theme";

class ReviewStars extends Component<{ rating: number, fontSize: number }> {

  styles = StyleSheet.create({
    star: {
      fontSize: this.props.fontSize,
      color: theme.SECONDARY_COLOR
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
      name="md-star-half"
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
    const addHalfStar = rating % 1 > 0.4;
    let emptyStarCount = 5 - fullStarCount;

    if(addHalfStar){
      emptyStarCount --;
    }

    let stars = [];
    for (let i = 1; i <= fullStarCount; i++) {
      let star = this.FullStar(i);
      stars.push(star);
    }

    if(addHalfStar){
      stars.push(this.HalfStar(fullStarCount + 1));
    }

    for (let i = 1; i <= emptyStarCount; i++) {
      let star = this.EmptyStar(fullStarCount + 1 + i);
      stars.push(star);
    }

    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  }
}

export default ReviewStars;