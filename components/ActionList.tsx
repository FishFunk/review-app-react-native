import React from "react";
import { SafeAreaView, View, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
import FirebaseService from '../services/firebaseService';
import { getContactsPermission } from '../services/contactService';

const Item = (props: any) => (
  <TouchableOpacity onPress={props.onPress}>
    <Text style={styles.title}>{props.title}</Text>
  </TouchableOpacity>
);

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
            <SafeAreaView style={styles.container}>
                <View style={styles.item}>
                    <Item onPress={this.onClickFriends} title="Friends"/>
                </View>
                <View style={styles.item}>
                    <Item onPress={this.onPress} title="Favorites"/>
                </View>
                <View style={styles.item}>
                    <Item onPress={this.onPress} title="Reviews"/>
                </View>
                <View style={styles.item}>
                    <Item onPress={this.onPress} title="Followers"/>
                </View>
                <View style={styles.itemLast}>
                    <Item onPress={this.onLogout} title="Logout"/>
                </View>
                {/* <View style={styles.itemLast}>
                    <Button title="Logout" onPress={this.onLogout}/>
                </View> */}
            </SafeAreaView>

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