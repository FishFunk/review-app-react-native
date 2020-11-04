import React from 'react';
import { StyleSheet, Image, FlatList } from 'react-native';

export default function HorizontalPhotoList(
    props: { photoUrls: string[] }){

    const _renderItem = function({item}){
        return( 
            <Image 
                style={styles.photo}
                source={{ uri: item }}>
            </Image>)
    }

    return ( 
        <FlatList 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollView} 
            data={props.photoUrls} 
            keyExtractor={(x, i) => i.toString()}
            renderItem={_renderItem}/>
    )
}

const photoWidth = 250;
const photoHeight = 160;
const styles = StyleSheet.create({
    scrollView: {
        height: photoHeight,
        marginRight: 8,
        marginLeft: 8
    },
    photo: {
        height: photoHeight,
        width: photoWidth,
        margin: 2
    }
  });