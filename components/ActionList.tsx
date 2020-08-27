import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { 
  List, 
  ListItem, 
  Text, 
  Left, 
  Right, 
  Icon } from 'native-base';
import FirebaseService from '../services/firebaseService';
import { getContactsPermission } from '../services/contactService';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class ActionList extends React.Component {
  
    state = { };

    onPress(){
        alert("Not implemented");
    }

    onLogout(){
        FirebaseService.signOut();
    }

    async onClickFriends(){
        const data = await getContactsPermission()
            .catch(error => console.error(error));

        console.log(data);
    }

    render(){
        return (
          <View style={{ width: '100%', height: '100%' }}>
            <List>
              <ListItem button={true} onPress={this.onClickFriends}>
                <Left>
                  <Text>Friends</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
              <ListItem button={true} onPress={this.onPress}>
              <Left>
                  <Text>Favorites</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
              <ListItem button={true} onPress={this.onLogout}>
                <Left>
                  <Text>Logout</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            </List>
          </View>
        )};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  item: {
    height: 50,
    borderTopColor: 'black',
    borderTopWidth: 1,
    padding: 5
  },
  itemLast: {
    height: 50,
    borderTopColor: 'black',
    borderTopWidth: 1,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    padding: 5
  },
  title: {
    fontSize: 24
  },
});