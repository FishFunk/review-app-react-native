import React from 'react';
import { 
    ListItem, 
    Text, 
    Left, 
    Icon, 
    Button, 
    Body
  } from 'native-base';
import { StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import { appUser } from '../../models/user';
import ListAvatar from '../profile/ListAvatar';

export default function UserListItem(
    props: { user: appUser, onButtonPress: (following: boolean) => void, following: boolean, children?: any }) {

    const { user, onButtonPress, following } = props;
    const verified = user.reviews ? user.reviews.length > 0 : false
        && user.email_verified 
        && user.phone_verified;

    return (
        <ListItem avatar>
            <Left>
                <ListAvatar user_verified={verified} img={user.photoUrl || ''} />
            </Left>
            <Body style={styles.body}>
                <Text>{user.firstName} {user.lastName}</Text>
                { props.children }
            </Body>
            <Button 
                style={{top: '20%', right: '5%', position: 'absolute'}}
                transparent
                onPress={()=>onButtonPress(following)}>
                {
                    following ? 
                        <Icon 
                            style={styles.followingIcon} 
                            type={"SimpleLineIcons"} 
                            name="user-following" /> : 
                        <Icon 
                            style={styles.followIcon} 
                            type={"SimpleLineIcons"} 
                            name="user-follow" />
                }
            </Button>
        </ListItem>
    );
}

const styles = StyleSheet.create({
    followIcon: {
        fontSize: 28,
        color: theme.PRIMARY_COLOR
    },
    followingIcon: {
        fontSize: 28,
        color: theme.SECONDARY_COLOR
    },
    body: {
        minHeight: 80,
        justifyContent: 'center'
    },
    subText: {
        fontFamily: theme.fontLight,
        fontSize: 10
    }
});