import React, { Component } from "react";
import { View , StyleSheet} from "react-native";
import { Icon } from 'native-base';
import theme from "../../styles/theme";

class EditableStars extends Component<{ onRatingChanged: Function }> {

    state = {
        rating: 3
    }

    updateRating(newRating: number){
        this.props.onRatingChanged(newRating);
        this.setState({ rating: newRating });
    }

    FullStar = (key: any) => (
        <Icon 
            onPress={this.updateRating.bind(this, key)}
            style={styles.star}
            key={key} name="ios-star"/>
    );

    EmptyStar = (key: any) => (
        <Icon
            onPress={this.updateRating.bind(this, key)}
            style={styles.star}
            key={key}
            name="ios-star-outline"
        />
    );

    render() {
        const { rating } = this.state;

        let stars = [];
        for (let i = 1; i <= 5; i++) {
            let star: JSX.Element;
            if(i <= rating){
                star = this.FullStar(i);
            } else {
                star = this.EmptyStar(i);
            }
            
            stars.push(star);
        }

        return <View style={{ flexDirection: "row" }}>{stars}</View>;
    }
}

export default EditableStars;

const styles = StyleSheet.create({
  star: {
    color: theme.SECONDARY_COLOR,
    fontSize: 50
  }
});