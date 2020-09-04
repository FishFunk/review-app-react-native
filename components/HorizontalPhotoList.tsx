import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { List, ListItem } from 'native-base';
import { StyleSheet, Image, StyleProp, ViewStyle } from 'react-native';

export default function HorizontalPhotoList(
    props: { photoUrls: string[], containerStyle?: StyleProp<ViewStyle> }){
    return (
        <ScrollView horizontal style={props.containerStyle}>
            <List style={styles.photoList}>
            {
                props.photoUrls.map((url: string, idx: number)=> <ListItem 
                    key={idx} style={styles.photoListItem} noBorder>
                    <Image 
                        key={idx}
                        style={styles.photo}
                        source={{ uri: url }}>
                    </Image></ListItem>)
            }
            </List>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    photoList: {
        flex:1, 
        flexDirection:'row',
        height: 200
    },
    photoListItem: {
        padding: 0,
        margin: 0
    },
    photo: {
        height: 200,
        width: 300,
        padding: 0,
        margin: 0
    }
  });