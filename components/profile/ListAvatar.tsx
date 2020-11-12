import React from 'react';
import theme from '../../styles/theme';
import { View, StyleSheet } from 'react-native';
import { Icon, Label, Thumbnail } from 'native-base';

export default function ListAvatar(props: { img: string, user_verified: boolean }) {
    const styles = StyleSheet.create({
        userAvatar: {
            width: 50, 
            height: 50, 
            alignSelf: 'center',
            justifyContent: 'center'
        },
        verifiedUserAvatar: {
            width: 56, 
            height: 56,
            borderWidth: 3,
            borderColor: theme.PRIMARY_COLOR,
            borderRadius: 30
        },
        verifiedLabel: {
            fontSize: 10,
            color: theme.DARK_COLOR,
            alignSelf: 'center'
        },
        verifiedContainer: {
            flexDirection: 'row', 
            marginTop: 5, 
            justifyContent: 'space-evenly'
        }
    });


    return (
        <View>
            {
                props.user_verified ?
                    <View style={styles.verifiedUserAvatar}>
                        <Thumbnail
                            style={styles.userAvatar}
                            source={{ uri: props.img }} 
                            defaultSource={require('../../assets/images/profile.png')} />
                        <View style={styles.verifiedContainer}>
                            <Icon style={{
                                fontSize: 14,
                                color: theme.STAR_COLOR,
                                alignSelf: 'center' }} 
                                name={'award'} 
                                type={'FontAwesome5'}></Icon>
                            <Label style={styles.verifiedLabel}>Verified</Label>
                        </View>
                    </View> : 
                    <Thumbnail
                        style={styles.userAvatar}
                        source={{ uri: props.img }} 
                        defaultSource={require('../../assets/images/profile.png')} />
                }
        </View>
    )
}