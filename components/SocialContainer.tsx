import React from 'react';
import { StyleSheet, View } from 'react-native';
import { 
  List, 
  ListItem, 
  Text, 
  Left, 
  Right, 
  Icon, 
  Button, 
  Spinner,
  Thumbnail
} from 'native-base';
import FirebaseService from '../services/firebaseService';
import { 
    getContacts, 
    checkContactsPermission, 
    requestContactsPermission } from '../services/contactService';
import theme from '../styles/theme';
import { appUser } from '../models/user';
import _without from 'lodash/without';
import _indexOf from 'lodash/indexOf';
import _map from 'lodash/map';
import UndrawFollowingSvg from '../svgs/undraw_following';

export default class SocialContainer extends React.Component<{},
    { suggestedFriends: Array<appUser>, followingFriends: Array<appUser>, loading: boolean }> {
  
    state = {
        loading: true,
        suggestedFriends: new Array<appUser>(),
        followingFriends: new Array<appUser>()
     };

    onLogout(){
        FirebaseService.signOut();
    }

    componentDidMount(){
        this.init()
            .finally(()=>this.setState({ loading: false }));
    }

    async init(){
        const isGranted = await checkContactsPermission();
        if(isGranted){
            const contacts = await getContacts();
            const allSuggestedFriends = await FirebaseService.findFriends(contacts);
            const followingIds = await FirebaseService.getUserFollowingIds();
            let followingFriends = [];
            let suggestedFriends = [];

            for(let possibleFriend of allSuggestedFriends){
                // Suggested Friends not yet following
                if(_indexOf(followingIds, possibleFriend.id) === -1){
                    suggestedFriends.push(possibleFriend);
                } else {
                    // Following Friends
                    followingFriends.push(possibleFriend);
                }
            }
            
            this.setState({ 
                suggestedFriends: suggestedFriends, 
                followingFriends: followingFriends });
        } else {
            await requestContactsPermission();
        }
    }

    onAddContact(user: appUser){
        const { followingFriends, suggestedFriends } = this.state;

        const newSuggested = _without(suggestedFriends, user);
        followingFriends.push(user);
        const newIds = _map(followingFriends, f => f.id);

        this.setState({ followingFriends: followingFriends, suggestedFriends: newSuggested });
        this.updateUserFollowingIds(newIds);
    }

    onRemoveContact(user: appUser){
        const { followingFriends, suggestedFriends } = this.state;
        let newIds = new Array<string>();
        let newFriends = new Array<appUser>();

        for (let f of followingFriends){
            if(f.id && f.id !== user.id){
                newIds.push(f.id);
                newFriends.push(f);
            }
        }

        suggestedFriends.push(user);

        this.setState({ followingFriends: newFriends, suggestedFriends: suggestedFriends });
        this.updateUserFollowingIds(newIds);
    }

    updateUserFollowingIds(ids: string[]){
        FirebaseService.updateUserData({ following: ids })
            .catch((error)=> FirebaseService.logError(error));
    }

    render(){
        if(this.state.loading){
            return <Spinner/>
        }
        return (
          <View style={styles.container}>
            <View style={styles.svgContainer}>
                <UndrawFollowingSvg width='75%' height='200px'/>
            </View>
            {
                this.state.followingFriends.length > 0 || this.state.suggestedFriends.length > 0?
                    <List>
                        {                      
                            this.state.suggestedFriends.length > 0 ?  
                                <ListItem itemDivider style={styles.itemDivider}>
                                    <Text style={styles.dividerText}>People You May Know</Text>
                                    <Text style={styles.dividerText}>Follow</Text>
                                </ListItem> : null
                        }
                        {
                            this.state.suggestedFriends.map((user: appUser)=>
                                <ListItem key={user.id}>
                                    <Left>
                                        <Thumbnail 
                                            source={{ uri: user.photoUrl }} 
                                            defaultSource={require('../assets/images/profile.png')}/>
                                        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                                    </Left>
                                    <Right>
                                        {
                                            <Button 
                                                transparent
                                                onPress={this.onAddContact.bind(this, user)}>
                                                <Icon style={styles.followIcon} type={"SimpleLineIcons"} name="user-follow" />
                                            </Button>
                                        }
            
                                    </Right>
                                </ListItem>
                            )
                        }
                        {                      
                            this.state.followingFriends.length > 0 ?  
                                <ListItem itemDivider style={styles.itemDivider}>
                                    <Text style={styles.dividerText}>People You Follow</Text>
                                    <Text style={styles.dividerText}>Unfollow</Text>
                                </ListItem>  : null
                        }
                        {
                            this.state.followingFriends.map((user: appUser, idx)=>
                                <ListItem key={user.id}>
                                    <Left>
                                        <Thumbnail 
                                            source={{ uri: user.photoUrl }} 
                                            defaultSource={require('../assets/images/profile.png')}/>
                                        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                                   </Left>
                                    <Right>
                                        {
                                            <Button 
                                                transparent
                                                onPress={this.onRemoveContact.bind(this, user)}>
                                                <Icon style={styles.followingIcon} type={"SimpleLineIcons"} name="user-following" />
                                            </Button>
                                        }
            
                                    </Right>
                                </ListItem>
                            )
                        }
                    </List> : 
                    <View style={styles.emptyListView}>
                        <Text style={styles.emptyListText}>
                            Looks like we can't find anybody you might know in our system. Spread the word!
                        </Text>
                        <Button small style={styles.emptyListButton}><Text>Invite Friends</Text></Button>
                        <Text style={styles.emptyListText}>
                            Make sure you give us permission to check your contacts!
                        </Text>
                        <Button small style={styles.emptyListButton}><Text>Request Contacts</Text></Button>
                        <Text style={styles.emptyListText}>
                            You can also connect a social media account!
                        </Text>
                        <Button small style={styles.emptyListButton}><Text>Connect Facebook</Text></Button>
                        <Button small style={styles.emptyListButton}><Text>Connect Google</Text></Button>
                    </View>
            }
          </View>
        )};
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },
    itemDivider: {
        backgroundColor: theme.LIGHT_COLOR,
        justifyContent: 'space-between',
        paddingRight: 25
    },
    dividerText: {
        color: theme.DARK_COLOR,
        fontWeight: 'bold'
    },
    svgContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    followIcon: {
        fontSize: 28,
        color: theme.PRIMARY_COLOR
    },
    followingIcon: {
        fontSize: 28,
        color: theme.SECONDARY_COLOR
    },
    emptyListView: {
        flex: 1,
        width: '100%',
        padding: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center'

    },
    emptyListText: {
        color: theme.DARK_COLOR,
        fontWeight: '300',
        fontSize: 18,
        margin: 5,
        width: '100%',
        textAlign: 'center'
    },
    emptyListButton: {
        alignSelf: 'center'
    },
    name: {
        paddingLeft: 10
    }
});