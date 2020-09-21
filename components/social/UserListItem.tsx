import React from 'react';
import { 
    ListItem, 
    Text, 
    Left, 
    Right, 
    Icon, 
    Button, 
    Thumbnail
  } from 'native-base';
import { StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import { appUser } from '../../models/user';

export default function UserListItem(
    props: { user: appUser, onButtonPress: (following: boolean) => void, following: boolean }) {

    const { user, onButtonPress, following } = props;
    return (
        <ListItem>
            <Left>
                <Thumbnail 
                    source={{ uri: user.photoUrl }} 
                    defaultSource={require('../../assets/images/profile.png')}/>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            </Left>
            <Right>
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
            </Right>
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
    name: {
        paddingLeft: 10
    }
});