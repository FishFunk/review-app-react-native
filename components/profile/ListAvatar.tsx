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
        verifiedContainer: {
            backgroundColor: theme.PRIMARY_COLOR,
            flexDirection: 'row', 
            alignSelf: 'center',
            marginTop: -4,
            marginBottom: 2,
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 5,
            paddingRight: 5,
            borderRadius: 10
        },
        verifiedLabel: {
            fontSize: 10,
            fontFamily: theme.fontBold,
            color: theme.LIGHT_COLOR
        },
        verifiedIcon: {
            fontSize: 14,
            color: theme.STAR_COLOR
        }
    });


    return (
        <View style={{width: 60, minHeight: 60, justifyContent: 'center'}}>
            {
                props.user_verified ?
                    <View>
                        <View style={styles.verifiedUserAvatar}>
                            <Thumbnail
                                style={styles.userAvatar}
                                source={{ uri: props.img ? props.img : null }} 
                                defaultSource={require('../../assets/images/profile.png')} />
                        </View>
                        <View style={styles.verifiedContainer}>
                            <Icon style={styles.verifiedIcon} 
                                name={'award'} 
                                type={'FontAwesome5'}></Icon>
                            <Label style={styles.verifiedLabel}>Verified</Label>
                        </View>
                    </View> : 
                    <Thumbnail
                        style={styles.userAvatar}
                        source={{ uri: props.img ? props.img : null }} 
                        defaultSource={require('../../assets/images/profile.png')} />
                }
        </View>
    )
}