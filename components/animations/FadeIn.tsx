import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export default function FadeInView(props: { style: any, children: any, delay?: number }){
  const fadeAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        useNativeDriver: true,
        toValue: 1,
        duration: 2000,
        delay: props.delay
      }
    ).start();
  }, [fadeAnim])

  return (
    <Animated.View   // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim,  // Bind opacity to animated value
      }}
    >
      {props.children}
    </Animated.View>
  );
}