import { View } from 'native-base';
import React from 'react';
import { Image } from 'react-native';

export default function Logo() {
    return (
        <View>
            <Image
                style={{ width: 80, height: 40 }}
                source={require('../assets/images/color_logo.png')}
            />
        </View>
    );
}