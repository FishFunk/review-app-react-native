import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Icon } from 'native-base';
import theme from "../../styles/theme";

class ReviewDollars extends Component<{ rating: number, fontSize: number, style?: any }> {

  styles = StyleSheet.create({
    fullDollar: {
      fontSize: this.props.fontSize,
      color: theme.DARK_COLOR
    },
    emptyDollar: {
      fontSize: this.props.fontSize,
        color: theme.GRAY_COLOR
    }
  });

  FullDollar = (key: any) => (
    <Icon       
      style={this.styles.fullDollar}
      key={key} 
      type={'FontAwesome5'}
      name="dollar-sign"/>);

  EmptyDollar = (key: any) => (
    <Icon
      style={this.styles.emptyDollar}
      key={key}
      type={'FontAwesome5'}
      name="dollar-sign"
    />);

  render() {
    const { rating } = this.props;
    const fullDollarCount = Math.round(rating);
    let emptyDollarCount = 4 - fullDollarCount;

    let dollarSigns = [];
    for (let i = 1; i <= fullDollarCount; i++) {
      let icon = this.FullDollar(i);
      dollarSigns.push(icon);
    }

    for (let i = 1; i <= emptyDollarCount; i++) {
      let icon = this.EmptyDollar(fullDollarCount + 1 + i);
      dollarSigns.push(icon);
    }

    return <View style={{ flexDirection: "row", ...this.props.style }}>
        {dollarSigns}
      </View>;
  }
}

export default ReviewDollars;