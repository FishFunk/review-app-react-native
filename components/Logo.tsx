import React from 'react';
import { Image } from 'react-native';

export default function Logo() {
    return (
        <Image
            style={{ width: 25, height: 25 }}
            source={require('../assets/images/icon.png')}
        />
    );
}