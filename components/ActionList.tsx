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
import theme from '../styles/theme';

export default class ActionList extends React.Component {
  
    state = { };

    onPress(){
        alert("Not implemented");
    }

    onLogout(){
        FirebaseService.signOut();
    }

    render(){
        return (
          <View style={{ width: '100%', height: '100%' }}>
            <List>
              <ListItem button={true}>
                <Left>
                  <Text>Following</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
              <ListItem button={true}>
                <Left>
                  <Text>Followers</Text>
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
              <ListItem button={true} onPress={this.onPress}>
              <Left>
                  <Text>My Reviews</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
              <ListItem button={true}>
                <Left>
                  <Text>Some other option</Text>
                </Left>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            </List>
            <View style={styles.buttonContainer}>
              <Button transparent onPress={this.onLogout} style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
              </Button>
            </View>
          </View>
        )};
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  buttonContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    flexDirection: 'row'
  },
  button: {
    marginTop: 200
  },
  buttonText: {
    color: theme.DANGER_COLOR
  }
});