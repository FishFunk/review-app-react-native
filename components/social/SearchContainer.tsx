import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { List, View, Item, Input } from 'native-base';
import { StyleSheet } from 'react-native';
import { appUser } from '../../models/user';
import FirebaseService from '../../services/firebaseService';
import UserListItem from './UserListItem';
import _indexOf from 'lodash/indexOf';
import _without from 'lodash/without';

export default function SearchContainer(props: any){

    const [allUsers, setAllUsers] = useState(new Array<appUser>());
    const [filteredUsers, setFilteredUsers] = useState(new Array<appUser>());
    const [searchInput, setInput] = useState('');
    const [followingIds, setFollowingIds] = useState(new Array<string>());

    useEffect(()=>{
        FirebaseService.searchUsers('')
            .then(results=>{
                setAllUsers(results);
                setFilteredUsers(results);
            });
    }, []);

    useEffect(()=>{
        FirebaseService.getUserFollowingIds()
            .then(ids=>{
                setFollowingIds(ids);
            });
    }, []);

    function onButtonPress(user: appUser, following: boolean){
        let newIds: string[] = JSON.parse(JSON.stringify(followingIds));
        if(!following){
            newIds.push(user.id);
            setFollowingIds(newIds);
            FirebaseService.updateUserData({ following: newIds });
        } else {
            const setIds = _without<string>(newIds, user.id);
            setFollowingIds(setIds);
            FirebaseService.updateUserData({ following: setIds });
        }
    }

    function filterResults(text: string){
        setInput(text);
        
        let newResults = [];
        for (let usr of allUsers){
            if(usr.email?.toLowerCase().search(text.toLowerCase()) > -1 ||
                usr.firstName?.toLowerCase().search(text.toLowerCase()) > -1 || 
                usr.lastName?.toLowerCase().search(text.toLowerCase()) > -1)
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
                            onButtonPress={(following: boolean)=>onButtonPress(user, following)}
                            following={_indexOf(followingIds, user.id)>=0}/>)
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