import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { 
  List, 
  ListItem, 
  Text, 
  Button, 
  Icon,
  Toast
} from 'native-base';
import FirebaseService from '../../services/firebaseService';
import { 
    getContacts, 
    checkContactsPermission, 
    requestContactsPermission } from '../../services/contactService';
import theme from '../../styles/theme';
import { appUser } from '../../models/user';
import _without from 'lodash/without';
import _indexOf from 'lodash/indexOf';
import _map from 'lodash/map';
import UserListItem from './UserListItem';
import { ScrollView } from 'react-native-gesture-handler';
import { openShareSheet } from '../../services/shareService';
import { iosAppStoreUrl, androidPlayStoreUrl } from '../../constants/Urls';
import { socialShareMessage } from '../../constants/Messages';
import SpinnerContainer from '../SpinnerContainer';
import UndrawFollowersSvg from '../../svgs/undraw_followers';
import { Contact } from 'expo-contacts';

export default class SocialContainer extends React.Component<{
        navigation: any
    },
    { 
        suggestedFriends: Array<appUser>, 
        followingFriends: Array<appUser>, 
        topReviewers: Array<appUser>, 
        followingIds: Array<string>,
        loading: boolean,
        permissionGranted: boolean
    }> {
  
    state = {
        loading: true,
        suggestedFriends: new Array<appUser>(),
        followingFriends: new Array<appUser>(),
        topReviewers: new Array<appUser>(),
        permissionGranted: false,
        followingIds: new Array<string>()
    };

    _unsubscribe: any;

    onLogout(){
        FirebaseService.signOut();
    }

    componentDidMount(){
        this.init()
            .then((finalPermission: boolean)=> this.setState({ permissionGranted: finalPermission }))
            .finally(async ()=>{
                await this.populateSocialLists();
                this._unsubscribe = this.props.navigation.addListener('focus', this.populateSocialLists.bind(this));
                this.setState({ loading: false });
            });
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    async init(): Promise<boolean>{
        let finalPermission = await checkContactsPermission();
        if(!finalPermission){
            finalPermission = await requestContactsPermission();
        }

        if(!finalPermission){
            Toast.show({
                text: 'To work properly, this feature requires access to your phone contacts. You can edit permissions in your phone settings.',
                position: 'bottom',
                duration: 5000,
                buttonText: 'OK'
            });
        }

        return finalPermission;
    }

    async populateSocialLists(){
        let contacts: Contact[] = [];
        if(this.state.permissionGranted){
            try {
                contacts = await getContacts();
            } catch(ex) {
                FirebaseService.logError(ex);
            }
        }
        
        const [allSuggestedFriends, topReviewers] = await FirebaseService.findSuggestedConnections(contacts);
        const followingIds = await FirebaseService.getUserFollowingIds();
        const followingUsers = await FirebaseService.getMultipleUsers(followingIds);
        let suggestedFriends = [];

        for(let possibleFriend of allSuggestedFriends){
            // Suggested Friends not yet following
            if(_indexOf(followingIds, possibleFriend.id) === -1){
                suggestedFriends.push(possibleFriend);
            }
        }
        
        this.setState({ 
            followingIds: followingIds,
            suggestedFriends: suggestedFriends, 
            followingFriends: followingUsers,
            topReviewers: topReviewers
        });
    }

    onAddContact(user: appUser){
        const { followingFriends, suggestedFriends } = this.state;

        const newSuggested = _without(suggestedFriends, user);
        followingFriends.push(user);
        const newIds = _map(followingFriends, f => f.id);

        this.setState({ followingIds: newIds, followingFriends: followingFriends, suggestedFriends: newSuggested });
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

        this.setState({ followingIds: newIds, followingFriends: newFriends, suggestedFriends: suggestedFriends });
        this.updateUserFollowingIds(newIds);
    }

    updateUserFollowingIds(ids: string[]){
        FirebaseService.updateUserData({ following: ids })
            .catch((error: any)=> FirebaseService.logError(error));
    }

    async onPressInvite() {
        const url = Platform.OS == 'ios' ? iosAppStoreUrl : androidPlayStoreUrl;
        openShareSheet(url, socialShareMessage)
            .catch(error =>{
                FirebaseService.logError(error.message);
            });
    }

    render(){
        return (
          <ScrollView style={styles.container}>
            <View style={styles.svgContainer}>
                <UndrawFollowersSvg width='75%' height='200px'/>
            </View>
            {
                this.state.loading ? 
                <SpinnerContainer/> : 
                <View>
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
                                    <UserListItem 
                                        key={user.id}
                                        user={user} 
                                        following={false} 
                                        onButtonPress={this.onAddContact.bind(this, user)}/>)
                            }
                            {                      
                                this.state.topReviewers.length > 0 ?  
                                    <ListItem itemDivider style={styles.itemDivider}>
                                        <Text style={styles.dividerText}>Top Reviewers</Text>
                                    </ListItem>  : null
                            }
                            {
                                this.state.topReviewers.map((user: appUser, idx)=>
                                    <UserListItem 
                                        key={user.id}
                                        user={user} 
                                        following={_indexOf(this.state.followingIds, user.id) >= 0} 
                                        onButtonPress={()=>{
                                            _indexOf(this.state.followingIds, user.id) >= 0 ?
                                                this.onRemoveContact(user) :
                                                this.onAddContact(user);
                                        }}>
                                        <Text style={{paddingLeft: 10, fontSize: 14}}>{user.reviews?.length} reviews</Text>
                                    </UserListItem>)
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
                                    <UserListItem 
                                        key={user.id}
                                        user={user} 
                                        following={true} 
                                        onButtonPress={this.onRemoveContact.bind(this, user)} />)
                            }
                        </List> : 
                        <View style={styles.emptyListView}>
                            <Text style={styles.emptyListText}>
                                We can't find any of your contacts in our system. 
                                Lucky there is an easy fix for that!
                            </Text>
                            <Button  
                                style={styles.inviteButton}
                                onPress={this.onPressInvite.bind(this)}
                                >
                                <Icon type={'FontAwesome5'} name={'paper-plane'}/>
                                <Text style={styles.inviteText}>Invite Friends</Text>
                            </Button>
                        </View>
                }
                </View>
            }
          </ScrollView>
        )};
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },
    itemDivider: {
        backgroundColor: theme.GRAY_COLOR,
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
    emptyListView: {
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 10,
        justifyContent: 'space-evenly'
    },
    emptyListText: {
        color: theme.DARK_COLOR,
        fontWeight: '300',
        fontSize: 18,
        width: '100%',
        textAlign: 'center',
        padding: 5
    },
    inviteButton: {
        marginTop: 15,
        backgroundColor: theme.PRIMARY_COLOR,
        alignSelf: 'center'
    },
    inviteText: {
        fontWeight: 'bold'
    }
});