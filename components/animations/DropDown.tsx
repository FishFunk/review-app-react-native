import React, {Component} from 'react';
import { Animated } from 'react-native';
 
export default class DropDown extends Component<{},{dropDownAnimation: Animated.Value}> {

  state = {
    dropDownAnimation: new Animated.Value(500)
  }
 
  startAnimation=()=>{
      Animated.timing(this.state.dropDownAnimation, {
        useNativeDriver: false,
        toValue : 0,
        duration : 1000
      }).start();
 
  }
 
  render() {
    return (
        <Animated.View
          style={{
            transform: [{translateY: this.state.dropDownAnimation}],
          }}
        >
          {this.props.children}
        </Animated.View>
      );
  }
};