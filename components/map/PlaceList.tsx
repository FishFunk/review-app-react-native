import React from "react";
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Body, Button, Icon, Left, ListItem, Spinner, Text, Thumbnail, Title, View } from "native-base";
import { placeMarkerData } from "../../models/place";
import { FlatList } from "react-native-gesture-handler";
import { getPhotoUrl } from '../../services/googlePlaceApiService';
import Utils from '../../services/utils';
import _isEqual from 'lodash/isEqual';
import DropDownPicker from 'react-native-dropdown-picker';
import theme from "../../styles/theme";
import _orderBy from 'lodash/orderBy';
import StarRatingListItem from "../reviews/StarRatingListItem";
import ReviewDollars from "../reviews/ReviewDollars";

export default class PlaceList extends React.Component<
    { 
        apiKey: string,
        places: placeMarkerData[], 
        onShowPlaceDetails: (placeSummary: placeMarkerData) => any,
        onUpdateSortOrder: (orderBy: string) => any,
        onLoadMoreResults:()=> any,
        orderBy: string,
        showLoadMoreOption: boolean
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
        this.load();
    }

    componentDidUpdate(prevProps: any){
        if(!_isEqual(prevProps.places, this.props.places)){
            this.load();
        }
    }

    async load(){
        const { apiKey, places } = this.props;

        let detailedPlaces = []
        for(let placeSummary of places){

            let photoUrl;
            if(placeSummary.photos){
                // prefetch first photo
                if(placeSummary.photos[0]){
                    photoUrl = getPhotoUrl(apiKey, placeSummary.photos[0].photo_reference);
                    // await Image.prefetch(photoUrl);
                }
            }

            detailedPlaces.push({
                ...placeSummary,
                openInfo: Utils.checkForOpenCloseHours(placeSummary.opening_hours),
                photoUrl: photoUrl
            });
        }

        this.sortPlaces(detailedPlaces, this.props.orderBy);
        this.setState({ loading: false });
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
            case('yelp'):
                orderedList = _orderBy(places, (p) => p.yelpRating, 'desc');
                break;
            case('google'):
                orderedList = _orderBy(places, (p) => p.googleRating, 'desc');
                break;
            default:
                orderedList = places;
        }

        this.setState({ detailedPlaces: orderedList });
    }

    onPressLoadMore(){
        this.setState({ loading: true });
        this.props.onLoadMoreResults();
    }

    // Render each place in flat list
    renderListItem(item: any){
        return (<ListItem 
            style={styles.listItem}
            avatar
            onPress={this.props.onShowPlaceDetails.bind(this, item)}>
            <Left>
                <Thumbnail
                    square
                    style={{ width: 130, height: 105, justifyContent: 'center' }}
                    source={{ uri: item.photoUrl }} 
                    defaultSource={require('../../assets/images/no-image-default.png')}
                    />
            </Left>
            <Body>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.title}>{item.title}</Text>
                        <ReviewDollars 
                            rating={item.pricing} 
                            fontSize={16} 
                            style={{ alignSelf: 'center' }}/>
                    </View>
                    <StarRatingListItem 
                        noBullCount={item.reviewCount}
                        noBullRating={item.rating} 
                        googleRating={item.googleRating}
                        googleCount={item.googleCount}
                        yelpRating={item.yelpRating} 
                        yelpCount={item.yelpCount}/>
                    <View style={{height: 5}}></View>
                    {/* {
                    item.address? 
                        <Text style={styles.info}>{item.address.split(',')[0]}</Text> : null
                    } */}
                    {
                        item.openInfo ? 
                            item.openInfo.open_now ? 
                                <Text style={styles.importantText}>{item.openInfo.message ? item.openInfo.message : 'Open' }</Text> : 
                                <Text style={styles.warningText}>{item.openInfo.message ? item.openInfo.message : 'Closed' }</Text>
                            : null
                    }
                    {
                        item.business_status === 'CLOSED_TEMPORARILY' ?
                            <Text style={styles.warningText}>Closed Temporarily</Text> : null
                    }
                    {
                        item.business_status === 'CLOSED_PERMANENTLY' ?
                            <Text style={styles.warningText}>Closed Permanently</Text> : null
                    }
                </View>
            </Body>
        </ListItem>)
    }

    render(){
        return (
            <View style={styles.container}>
                { 
                    Platform.OS === 'ios' ? // TODO: Picker doesnt work well on android and react native picker sucks. Need custom implementation.
                    <DropDownPicker 
                        searchable={false}
                        items={[
                            {label: 'NoBull', value: 'rating', 
                                icon: () => <Icon name="ios-star" style={{ fontSize: 14, color: theme.STAR_COLOR, marginLeft: 1 }} />},
                            {label: 'Pricing', value: 'pricing', 
                                icon: () => <Icon name="dollar-sign" type={'FontAwesome5'} style={{fontSize: 14, color: theme.SECONDARY_COLOR, marginLeft: 4, marginRight: 4, alignSelf: 'center' }} /> },
                            {label: 'Google', value: 'google', 
                                icon: () => <Icon name="google" type={'FontAwesome5'} style={{ fontSize: 14, color: theme.googleRed, marginLeft: 2, alignSelf: 'center' }} />},
                            {label: 'Yelp', value: 'yelp', 
                                icon: () => <Icon name="yelp" type={'FontAwesome5'} style={{ fontSize: 14, color: theme.yelpRed, marginLeft: 4, marginRight: 2, alignSelf: 'center' }} />}
                        ]}
                        defaultValue={this.props.orderBy}
                        style={{backgroundColor: theme.LIGHT_COLOR, borderWidth: 0 }}
                        labelStyle={{ fontSize: 12, fontFamily: theme.fontLight }}
                        placeholder="Order by"
                        itemStyle={{ justifyContent: 'flex-start' }}
                        containerStyle={{
                            height: 40,
                            width: 100, 
                            right: 5,
                            top: 5,
                            position: 'absolute' }}
                        onChangeItem={item => this.onChangeDropdownItem(item.value)}/> : null 
                }
                <View style={styles.header}>
                    {
                        this.state.loading ?
                            <Spinner size={'small'} color={theme.PRIMARY_COLOR} style={{width: 50}} />
                            : <View style={{width: 50}}></View>
                    }
                    <Title style={styles.headerText}>Nearby Places</Title>
                    <View style={{width: 50}}></View>
                </View>
                <FlatList
                    contentContainerStyle={styles.list} 
                    data={this.state.detailedPlaces} 
                    keyExtractor={(x, i) => i.toString()}
                    renderItem={({item}) => this.renderListItem(item)}/> 
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                {
                    this.props.showLoadMoreOption && !this.state.loading ?
                        <Button small transparent onPress={this.onPressLoadMore.bind(this)}>
                            <Text style={{ fontSize: 14, color: theme.PRIMARY_COLOR }}>
                                Load More
                            </Text>
                        </Button> : null
                }
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: 50,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.GRAY_COLOR
    },
    headerText: {
        fontSize: 15
    },
    list: {
        paddingRight: 5,
        paddingBottom: 10
    },
    listItem: {
        maxHeight: 200
    },
    title: {
        fontSize: 12,
        paddingRight: 5,
        width: '80%',
        fontFamily: theme.fontBold
    },
    info: {
        marginTop: 4,
        fontSize: 12
    },
    importantText: {
        marginTop: 4,
        color: theme.PRIMARY_COLOR,
        fontSize: 10
    },
    warningText: {
        marginTop: 4,
        color: theme.DANGER_COLOR,
        fontSize: 10
    }
});