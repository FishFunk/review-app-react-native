import React from "react";
import { Dimensions, StyleSheet, Image } from 'react-native';
import { Body, Icon, Left, List, ListItem, Text, Thumbnail, Title, View } from "native-base";
import { dbPlace } from "../../models/place";
import { ScrollView } from "react-native-gesture-handler";
import ReviewStars from "../reviews/ReviewStars";
import { getGooglePlaceById, getPhotoUrl } from '../../services/googlePlaceApiService';
import ReviewDollars from "../reviews/ReviewDollars";
import SpinnerContainer from "../SpinnerContainer";
import { getPlaceAvgPricing, getPlaceAvgRating } from '../../services/utils';
import _isEqual from 'lodash/isEqual';
import DropDownPicker from 'react-native-dropdown-picker';
import theme from "../../styles/theme";
import _orderBy from 'lodash/orderBy';

export default class PlaceList extends React.Component<
    { 
        apiKey: string,
        places: dbPlace[], 
        onShowPlaceDetails: (placeId: string) => any,
        onUpdateSortOrder: (orderBy: string) => any,
        orderBy: string
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
                    // await Image.prefetch(photoUrl);
                }
            }

            detailedPlaces.push({
                id: p.id,
                name: p.name,
                rating: getPlaceAvgRating(p),
                pricing: getPlaceAvgPricing(p),
                address: apiPlace.formatted_address,
                status: apiPlace.business_status,
                open: apiPlace.opening_hours?.open_now,
                photoUrl: photoUrl
            });
        }

        this.sortPlaces(detailedPlaces, this.props.orderBy);
    }

    onChangeDropdownItem(orderBy: string){
        const { detailedPlaces } = this.state;
        this.sortPlaces(detailedPlaces, orderBy)
        this.props.onUpdateSortOrder(orderBy);
    }

    sortPlaces(places: Array<any>, orderType: string){
        let orderedList;

        switch(orderType){
            case('rating'):
                orderedList = _orderBy(places, (p) => p.rating, 'desc');
                break;
            case('pricing'):
                orderedList = _orderBy(places, (p) => p.pricing, 'asc');
                break;
            default:
                orderedList = places;
        }

        this.setState({ detailedPlaces: orderedList });
    }

    render(){
        return (
            <View style={styles.container}>
                <View>
                    <DropDownPicker 
                        searchable={false}
                        items={[
                            {label: 'Rating', value: 'rating', 
                                icon: () => <Icon name="star" type={'FontAwesome5'} style={{fontSize: 14, color: theme.STAR_COLOR}} />},
                            {label: 'Price', value: 'pricing', 
                                icon: () => <Icon name="dollar-sign" type={'FontAwesome5'} style={{fontSize: 14, color: theme.SECONDARY_COLOR}} /> }
                        ]}
                        defaultValue={this.props.orderBy}
                        style={{backgroundColor: theme.LIGHT_COLOR, borderWidth: 0}}
                        placeholder="Order by"
                        containerStyle={{
                            height: 40,
                            width: 100, 
                            right: 5,
                            top: 5,
                            position: 'absolute' }}
                        onChangeItem={item => this.onChangeDropdownItem(item.value)}/>
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
                                        <Text style={styles.info}>{place.address.split(',')[0]}</Text>
                                    </Body>
                                </ListItem>
                            )
                        }
                        </List>
                    </ScrollView>
                    { this.state.loading ? 
                            <SpinnerContainer /> : null }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('screen').height - 150 // offset plus header height
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        height: 50,
        width: '100%',
        borderBottomWidth: 0.5,
        borderBottomColor: theme.GRAY_COLOR
    },
    title: {
        alignSelf: 'center'
    },
    list: {
        paddingRight: 5
    },
    listItem: {
        maxHeight: 100
    },
    name: {
        fontWeight: 'bold'
    },
    info: {
        fontSize: 12
    }
});