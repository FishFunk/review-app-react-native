import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { List, View, Item, Input } from 'native-base';
import { StyleSheet } from 'react-native';
import { appUser } from '../../models/user';
import FirebaseService from '../../services/firebaseService';
import UserListItem from './UserListItem';
import _indexOf from 'lodash/indexOf';

export default function SearchContainer(props: any){

    const [allUsers, setAllUsers] = useState(new Array<appUser>());
    const [filteredUsers, setFilteredUsers] = useState(new Array<appUser>());
    const [searchInput, setInput] = useState('');

    useEffect(()=>{
        FirebaseService.searchUsers('')
            .then(results=>{
                setAllUsers(results);
                setFilteredUsers(results);
            });
    }, [])

    function onButtonPress(user: appUser){
        alert("not yet implemented");
    }

    function filterResults(text: string){
        setInput(text);
        
        let newResults = [];
        for (let usr of allUsers){
            if(usr.email?.search(text) > -1 ||
                usr.firstName?.search(text) > -1 || 
                usr.lastName?.search(text) > -1)
            {
                newResults.push(usr);
            }

        }

        setFilteredUsers(newResults);
    }

    return (
        <View style={styles.container}>
            <View>
                <Item style={styles.inputItem}>
                  <Input 
                    placeholder='Search for someone...'
                    onChangeText={text => filterResults(text)}
                    value={searchInput} />
                </Item>
            </View>
            <ScrollView>
                <List style={styles.list}>
                {
                    filteredUsers.map((user: appUser)=> 
                        <UserListItem 
                            user={user} 
                            onButtonPress={()=>onButtonPress(user)}
                            following={false}/>)
                }
                </List>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },
    list: {
        flex:1, 
        flexDirection:'column'
    },
    listItem: {
        padding: 0,
        margin: 0
    },
    inputItem: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 15
    }
});