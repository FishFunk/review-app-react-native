import { Spinner, View } from 'native-base';
import React from 'react';

export default function SpinnerContainer() {
    return (
        <View
            style={{ width: '100%', height: '100%', justifyContent: 'center' }}
        >
            <Spinner />
        </View>
    );
}