import React from 'react';
import { StyleSheet, View } from 'react-native';
import { 
  List, 
  ListItem, 
  Text, 
  Left, 
  Right, 
  Icon, 
  Button } from 'native-base';
import FirebaseService from '../services/firebaseService';
import { 
    getContacts, 
    checkContactsPermission, 
    requestContactsPermission } from '../services/contactService';
import theme from '../styles/theme';
import { appUser } from '../models/user';

export default class Social extends React.Component<{},{friends: appUser[], following: string[]}> {
  
    state = {
        friends: [],
        following: []
     };

    onPress(){
        alert("Not implemented");
    }

    onLogout(){
        FirebaseService.signOut();
    }

    componentDidMount(){
        this.init();
    }

    async init(){
        const isGranted = await checkContactsPermission();
        if(isGranted){
            const contacts = await getContacts();
            const friends = await FirebaseService.findFriends(contacts);
            const followingIds = await FirebaseService.getUserFollowingIds();
            console.log(friends);
            this.setState({ friends: friends, following: followingIds });
        } else {
            await requestContactsPermission();
        }
    }

    onAddContact(){

    }

    onRemoveContact(){

    }

    render(){
        return (
          <View style={styles.container}>
            <List>
                <ListItem itemDivider>
                    <Text>From Contacts</Text>
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
                                    <Button style={styles.addButton} onPress={this.onRemoveContact}>
                                        <Icon type={"SimpleLineIcons"} name="user-following" />
                                    </Button> :
                                    <Button style={styles.addButton} onPress={this.onAddContact}>
                                        <Icon type={"SimpleLineIcons"} name="user-follow" />
                                    </Button>
                                }
    
                            </Right>
                        </ListItem>
                    )
                }
                {/* <ListItem itemDivider>
                    <Text>From Facebook</Text>
                </ListItem> 
                <ListItem itemDivider>
                    <Text>Top Reviewers</Text>
                </ListItem>  */}
            </List>
          </View>
        )};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  addButton: {
      backgroundColor: theme.PRIMARY_COLOR
  }
});