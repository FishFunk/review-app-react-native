import React from "react";
import { Dimensions, StyleSheet, Image } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Body, Button, Content, Icon, Label, Left, List, ListItem, Right, Text, Thumbnail, Title, View } from "native-base";
import { dbPlace } from "../../models/place";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import ReviewStars from "../reviews/ReviewStars";
import { getGooglePlaceById, getPhotoUrl } from '../../services/googlePlaceApiService';
import ReviewDollars from "../reviews/ReviewDollars";
import SpinnerContainer from "../SpinnerContainer";

export default class PlaceListModal extends React.Component<
    { 
        apiKey: string,
        isOpen: boolean, 
        places: dbPlace[], 
        onDismissModal: () => any,
        onShowPlaceDetails: (placeId: string) => any
    }, 
    {
        loading: boolean,
        detailedPlaces: Array<any>
    }>{

    state = {
        loading: true,
        detailedPlaces: []
    }

    componentDidMount(){
        this.load()
            .then(()=> {
                this.setState({ loading: false });
            })
            .catch(error =>{
                console.error(error);
                this.setState({ loading: false });
            })
    }

    async load(){
        const { apiKey, places } = this.props;

        let detailedPlaces = []
        for(let p of places){
            const apiPlace = await getGooglePlaceById(apiKey, p.id, [
                'business_status', 'name', 'opening_hours', 'photos', 'formatted_address']);

            let photoUrl;
            if(apiPlace.photos){
                // prefetch first photo
                if(apiPlace.photos[0]){
                    photoUrl = getPhotoUrl(apiKey, apiPlace.photos[0].photo_reference);
                    await Image.prefetch(photoUrl);
                }
            }

            detailedPlaces.push({
                id: p.id,
                name: p.name,
                rating: p.rating,
                pricing: p.pricing,
                address: apiPlace.formatted_address,
                status: apiPlace.business_status,
                open: apiPlace.opening_hours?.open_now,
                photoUrl: photoUrl
            });
        }

        this.setState({ detailedPlaces: detailedPlaces });
    }

    render(){
        return (
            <Modal
                style={styles.modal}
                propagateSwipe
                isVisible={this.props.isOpen}
                animationIn={'slideInUp'}
                onBackdropPress={() => this.props.onDismissModal()}
                onSwipeComplete={() => this.props.onDismissModal()}
                swipeDirection="down">
                <Content scrollEnabled={false}>
                    
                    {
                        this.state.loading ? 
                        <SpinnerContainer /> :
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Title style={styles.title}>Nearby Places</Title>
                            </View>
                            <ScrollView>
                                <List style={styles.list}>
                                {
                                    this.state.detailedPlaces.map((place: any, idx: number)=> 
                                        <ListItem 
                                            key={idx}
                                            style={styles.listItem}
                                            avatar
                                            onPress={this.props.onShowPlaceDetails.bind(this, place.id)}>
                                            <Left>
                                                <Thumbnail 
                                                    square
                                                    source={{ uri: place.photoUrl }} 
                                                    // TODO: Add default image
                                                    />
                                            </Left>
                                            <Body>
                                                <Text style={styles.name}>{place.name}</Text>
                                                <ReviewStars rating={place.rating} fontSize={18} />
                                                <ReviewDollars rating={place.pricing} fontSize={14} />
                                                <Text>{place.address}</Text>
                                            </Body>
                                        </ListItem>
                                    )
                                }
                                </List>
                            </ScrollView>
                        </View>
                    }
                </Content>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        marginTop: 100,
        backgroundColor: theme.LIGHT_COLOR,
        width: '100%',
        margin: 0
    },
    container: {
        height: Dimensions.get('screen').height - 100
    },
    header: {
        height: 50,
        width: '100%'
    },
    title: {
        paddingTop: 10
    },
    list: {
        paddingRight: 5
    },
    listItem: {
        height: 100
    },
    name: {
        fontWeight: 'bold'
    }
});