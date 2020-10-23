import React from 'react';
import { 
    Icon, 
    Button, 
    View, 
    Label
} from "native-base";
import theme from '../../styles/theme';
import { ScrollView, StyleSheet } from 'react-native';
// import FirebaseService from '../../services/firebaseService';

export default function MapQuickSearchButtons(props: any) {

    const onQuickSearch = async (query: string) => {
        // let possibleType;
        // let possibleQuery;

        // switch(query){
        //     case('food'):
        //         possibleType = 'food';
        //         break;    
        //     case('bar'):
        //         possibleType = 'bar';
        //         break;    
        //     case('restuarant'):
        //         possibleType = 'restaurant';
        //         break;
        //     case('delivery'):
        //         possibleType = 'meal_delivery';
        //         break;
        //     case('cafe'):
        //         possibleType = 'cafe';
        //         break;   
        //     case('shopping'):
        //         possibleType = 'shopping_mall';
        //         break; 
        //     default:
        //         possibleQuery = query;
        // }

        // let places;
        // if(possibleType){
        //     places = await getGooglePlaceIdListByType(
        //         this.state.apiKey, 
        //         this.state.region.latitude, 
        //         this.state.region.longitude,
        //         possibleType);

        // } else {
        //     places = await getGooglePlaceIdListByQuery(
        //         this.state.apiKey, 
        //         this.state.region.latitude, 
        //         this.state.region.longitude,
        //         possibleQuery);
        // }

        // const { latitude, longitude } = this.state.region;

        // const nearbyPlaces = await FirebaseService.getNearbyPlaces(latitude, longitude, 15);
        // const filteredPlaces = nearbyPlaces.map((place)=> _indexOf(place.types, possibleType) >= 0);

        // const placeIds = places.map(p=>p.place_id);
        // const dbPlaces = await FirebaseService.getPlacesById(placeIds, false);

        // if(dbPlaces.length === 0){
        //     console.log("No places currently matching criteria. Try searching outside of network");
        // }

        // const markers = this.convertPlacesToMarkers(dbPlaces);

        // this.setState({markers: markers});
    }


    return (
        <View style={styles.exploreButtonContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{backgroundColor: 'transparent'}}
                contentContainerStyle={{backgroundColor: 'transparent'}}>                        
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'hotdog'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Food</Label>
                </Button>                    
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'cocktail'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Drinks</Label>
                </Button>
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'utensils'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Dining</Label>
                </Button>
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'pizza-slice'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Delivery</Label>
                </Button>
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'mug-hot'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Cafes</Label>
                </Button>
                <Button small rounded style={styles.exploreButton} iconLeft
                    onPress={()=>{}}>
                    <Icon type={'FontAwesome5'} name={'shopping-bag'} style={styles.exploreIcon}></Icon>
                    <Label style={styles.exploreLabel}>Shopping</Label>
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    exploreButtonContainer: {
        alignItems: 'center',
        position: 'absolute',
        top: 60,
        width: '100%',
        zIndex: 999
    },
    exploreButton: {
        fontSize: 10,
        height: 30,
        margin: 5,
        backgroundColor: theme.PRIMARY_COLOR
    },
    exploreIcon: {
        fontSize: 10,
        color: theme.LIGHT_COLOR
    },
    exploreLabel: {
        fontSize: 10,
        paddingLeft: 5,
        paddingRight: 10,
        color: theme.LIGHT_COLOR
    }
});