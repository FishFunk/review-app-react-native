import React, { Component } from "react";
import { View , StyleSheet} from "react-native";
import { Icon, Label } from 'native-base';
import theme from "../../styles/theme";

class EditableDollars extends Component<{ 
    onRatingChanged: Function, 
    initalRating?: number,
    fontSize?: number }> {

    defaultFontSize = 20;
    defaultRating = 3;

    styles = StyleSheet.create({
        dollarSign: {
            color: theme.SECONDARY_COLOR,
            fontSize: this.props.fontSize || this.defaultFontSize
        },
        emptyDollarSign: {
            color: theme.GRAY_COLOR,
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

    getDescription(){
        const { rating } = this.state;
        let description = '';

        switch(rating){
            case(1):
                description = 'FREE - $5 per person';
                break;
            case(2):
                description = '$10-$30 per person';
                break;
            case(3):
                description = '$30-$45 per person';
                break;
            case(4):
                description = '$50+ per person';
                break;
            default:
                ''
        }

        return description;
    }

    FullDollar = (key: any) => (
        <Icon       
            onPress={this.updateRating.bind(this, key)}
            style={this.styles.dollarSign}
            key={key} 
            type={'FontAwesome5'}
            name="dollar-sign" />);
    
    EmptyDollar = (key: any) => (
        <Icon
            onPress={this.updateRating.bind(this, key)}
            style={this.styles.emptyDollarSign}
            key={key}
            type={'FontAwesome5'}
            name="dollar-sign" />);

    render() {
        const { rating } = this.state;

        let dollarSigns = [];
        for (let i = 1; i <= 4; i++) {
            let icon: JSX.Element;
            if(i <= rating){
                icon = this.FullDollar(i);
            } else {
                icon = this.EmptyDollar(i);
            }
            
            dollarSigns.push(icon);
        }

        return <View>
                    <Label/>
                    <View style={{
                        flexDirection: "row", 
                        justifyContent: 'flex-end'
                        }}>{dollarSigns}</View>
                    <Label style={{ 
                        fontSize: 12 }}>
                        {this.getDescription()}
                    </Label>
            </View>;
    }
}

export default EditableDollars;