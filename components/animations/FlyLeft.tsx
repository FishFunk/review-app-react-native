import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export default function FlyLeft(props: any){
  const flyLeftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(
        flyLeftAnim,
      {
        useNativeDriver: true,
        toValue: -5000,
        duration: 1000,
      }
    ).start();
  }, [flyLeftAnim])

  return (
    <Animated.View 
      style={{
        ...props.style,
        transform: [{translateX: flyLeftAnim}],
      }}
    >
      {props.children}
    </Animated.View>
  );
}