import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { List, ListItem } from 'native-base';
import { StyleSheet, Image } from 'react-native';

export default function HorizontalPhotoList(
    props: { photoUrls: string[] }){
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollView}>
            <List style={styles.photoList}>
            {
                props.photoUrls.map((url: string, idx: number)=> <ListItem 
                    key={idx} style={styles.photoListItem} noBorder>
                    <Image 
                        key={idx}
                        style={styles.photo}
                        source={{ uri: url }}>
                    </Image>
                </ListItem>)
            }
            </List>
        </ScrollView>
    )
}

const photoWidth = 250;
const photoHeight = 150;
const styles = StyleSheet.create({
    scrollView: {
        height: photoHeight
    },
    photoList: {
        flexDirection:'row',
        height: photoHeight
    },
    photoListItem: {
        height: photoHeight,
        width: photoWidth
    },
    photo: {
        height: photoHeight,
        width: photoWidth
    }
  });