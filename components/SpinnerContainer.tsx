import { Spinner, View } from 'native-base';
import React from 'react';
import theme from '../styles/theme';

export default function SpinnerContainer(props: any) {
    return (
        <View
            style={{ width: '100%', height: '100%', justifyContent: 'center' }}
        >
            <Spinner color={props.color ? props.color : theme.PRIMARY_COLOR}/>
        </View>
    );
}