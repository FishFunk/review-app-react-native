import React from 'react';
import { StyleSheet, View } from 'react-native';
import { 
  List, 
  ListItem, 
  Text, 
  Left, 
  Right, 
  Icon, 
  Button} from 'native-base';
import FirebaseService from '../services/firebaseService';
import { getContacts, checkContactsPermission, requestContactsPermission } from '../services/contactService';
import theme from '../styles/theme';

export default class Social extends React.Component {
  
    state = {
        contacts: []
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
            this.setState({ contacts: contacts });
        } else {
            await requestContactsPermission();
        }
    }

    onAddContact(){

    }

    render(){
        return (
          <View style={styles.container}>
            <List>
                {
                    this.state.contacts.map((contact: any, idx: number)=>
                        <ListItem key={idx} button={true}>
                            <Left>
                                <Text>{contact.firstName} {contact.lastName}</Text>
                            </Left>
                            <Right>
                                <Button style={styles.addButton} onPress={this.onAddContact}>
                                    <Icon name="add" />
                                </Button>
                            </Right>
                      </ListItem>
                    )
                }
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