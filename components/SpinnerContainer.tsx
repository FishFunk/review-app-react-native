import { Spinner, View } from 'native-base';
import React from 'react';
import theme from '../styles/theme';
import { Dimensions, StyleSheet } from 'react-native';

export default function SpinnerContainer(props: { color?: string, transparent?: boolean }) {
    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            height: Dimensions.get('screen').height,
            right: 0,
            left: 0,
            justifyContent: 'center',
            backgroundColor: props.transparent ? 'transparent' : theme.LIGHT_COLOR,
            zIndex: 999999
        }
    });

    return (
        <View style={styles.container}>
            <Spinner color={props.color ? props.color : theme.PRIMARY_COLOR}/>
        </View>
    );
}