import React, { Component } from "react";
import { View , StyleSheet} from "react-native";
import { Icon } from 'native-base';
import theme from "../../styles/theme";

class EditableStars extends Component<{ 
    onRatingChanged: Function, 
    initalRating?: number,
    fontSize?: number }> {

    defaultFontSize = 20;
    defaultRating = 3;

    styles = StyleSheet.create({
        star: {
            color: theme.STAR_COLOR,
            fontSize: this.props.fontSize || this.defaultFontSize
        }
    });

    state = {
        rating: this.props.initalRating != null ? this.props.initalRating : this.defaultRating
    }

    updateRating(newRating: number){
        this.props.onRatingChanged(newRating);
        this.setState({ rating: newRating });
    }

    FullStar = (key: any) => (
        <Icon 
            onPress={this.updateRating.bind(this, key)}
            style={this.styles.star}
            key={key} name="ios-star"/>
    );

    HalfStar = (key: any) => (
        <Icon
          onPress={this.updateRating.bind(this, key)}
          style={this.styles.star}
          key={key}
          name="ios-star-half"
        />
      );

    EmptyStar = (key: any) => (
        <Icon
            onPress={this.updateRating.bind(this, key)}
            style={this.styles.star}
            key={key}
            name="ios-star-outline"
        />
    );

    render() {
        const { rating } = this.state;
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

        return <View style={{ flexDirection: "row" }}>{stars}</View>;
    }
}

export default EditableStars;