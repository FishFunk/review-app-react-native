import React from 'react';
import { 
    ListItem, 
    Text, 
    Left, 
    Right, 
    Icon, 
    Button, 
    Thumbnail,
    Body,
    View
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
        <ListItem style={{justifyContent: 'space-evenly'}}>
            <ListAvatar user_verified={verified} img={user.photoUrl || ''} />
            <Body>
                <Text style={styles.body}>{user.firstName} {user.lastName}</Text>
                { props.children }
            </Body>
            <Button 
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
        paddingLeft: 10
    }
});