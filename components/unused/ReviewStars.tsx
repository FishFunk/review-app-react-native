import React, { Component } from "react";
import { View } from "react-native";
import { Icon } from "react-native-elements";

class ReviewStars extends Component<{ rating: number }> {
  FullStar = (key: any) => (
    <Icon color="#FFC300" key={key} type="ionicon" name="ios-star" size={12} />
  );

  HalfStar = (key: any) => (
    <Icon
      color="#FFC300"
      key={key}
      type="ionicon"
      name="md-star-half"
      size={12}
    />
  );

  EmptyStar = (key: any) => (
    <Icon
      color="#FFC300"
      key={key}
      type="ionicon"
      name="ios-star-outline"
      size={12}
    />
  );
  render() {
    const { rating } = this.props;
    const fullStarCount = Math.floor(rating);
    const emptyStarCount = 5 - (5 - Math.floor(rating));
    const addHalfStar = rating % 1 > 0.4;

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

    return <View style={{ flex: 1, flexDirection: "row" }}>{stars}</View>;
  }
}

export default ReviewStars;