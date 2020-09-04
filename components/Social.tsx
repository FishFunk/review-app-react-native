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
  Spinner} from 'native-base';
import FirebaseService from '../services/firebaseService';
import { 
    getContacts, 
    checkContactsPermission, 
    requestContactsPermission } from '../services/contactService';
import theme from '../styles/theme';
import { appUser } from '../models/user';
import _without from 'lodash/without';
import UndrawFollowingSvg from '../svgs/undraw_following';

export default class Social extends React.Component<{},
    { friends: appUser[], following: string[], loading: boolean }> {
  
    state = {
        loading: true,
        friends: new Array<appUser>(),
        following: new Array<string>()
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
            const friends = await FirebaseService.findFriends(contacts);
            const followingIds = await FirebaseService.getUserFollowingIds();
            this.setState({ friends: friends, following: followingIds });
        } else {
            await requestContactsPermission();
        }
    }

    onAddContact(user: appUser){
        const { following } = this.state;
        following.push(user.id);
        this.setState({ following: following }, this.updateUserFollowingIds);
    }

    onRemoveContact(user: appUser){
        const { following } = this.state;
        const newList = _without(following, user.id);
        this.setState({ following: newList }, this.updateUserFollowingIds);
    }

    updateUserFollowingIds(){
        const { following: ids } = this.state;
        FirebaseService.updateUserData({ following: ids })
            .catch((error)=> console.error(error));
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
                this.state.friends.length > 0 ?
                    <List>
                        <ListItem itemDivider style={styles.itemDivider}>
                            <Text style={styles.dividerText}>People You May Know</Text>
                            <Text style={styles.dividerText}>Follow</Text>
                        </ListItem> 
                        {
                            this.state.friends.map((user: appUser, idx: number)=>
                                <ListItem key={idx}>
                                    <Left>
                                        <Text>{user.firstName} {user.lastName}</Text>
                                    </Left>
                                    <Right>
                                        {
                                            this.state.following.indexOf(user.id) > -1 ?
                                            <Button 
                                                transparent
                                                onPress={this.onRemoveContact.bind(this, user)}>
                                                <Icon style={styles.followingIcon} type={"SimpleLineIcons"} name="user-following" />
                                            </Button> :
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
    }
});