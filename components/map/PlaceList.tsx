import React from "react";
import { Dimensions, StyleSheet } from 'react-native';
import { Body, Icon, Left, ListItem, Text, Thumbnail, Title, View } from "native-base";
import { placeMarkerData } from "../../models/place";
import { FlatList } from "react-native-gesture-handler";
import { getPhotoUrl } from '../../services/googlePlaceApiService';
import SpinnerContainer from "../SpinnerContainer";
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
                    // TODO: Add default image
                    />
            </Left>
            <Body>
                <View style={{ width: 200 }}>
                    <View style={{flexDirection: 'row' }}>
                        <Text style={styles.title}>{item.title}</Text>
                        <ReviewDollars 
                            rating={item.pricing} 
                            fontSize={16} 
                            style={{marginTop: 4}}/>
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
                        item.status === 'CLOSED_TEMPORARILY' ?
                            <Text style={styles.warningText}>Closed Temporarily</Text> : null
                    }
                    {
                        item.status === 'CLOSED_PERMANENTLY' ?
                            <Text style={styles.warningText}>Closed Permanently</Text> : null
                    }
                </View>
            </Body>
        </ListItem>)
    }

    render(){
        return (
            <View style={styles.container}>
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
                    <Title style={styles.headerText}>Nearby Places</Title>
                </View>
                <FlatList 
                    contentContainerStyle={styles.list} 
                    data={this.state.detailedPlaces} 
                    keyExtractor={(x, i) => i.toString()}
                    renderItem={({item}) => this.renderListItem(item)}/>
                { this.state.loading ? 
                        <SpinnerContainer /> : null }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('screen').height - 100 // offset plus header height
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        height: 50,
        width: '100%',
        borderBottomWidth: 0.5,
        borderBottomColor: theme.GRAY_COLOR
    },
    headerText: {
        fontSize: 15,
        alignSelf: 'center'
    },
    list: {
        paddingRight: 5
    },
    listItem: {
        maxHeight: 200
    },
    title: {
        fontSize: 12,
        width: 160,
        fontFamily: theme.fontBold
    },
    info: {
        marginTop: 4,
        fontSize: 12
    },
    importantText: {
        marginTop: 4,
        color: theme.PRIMARY_COLOR,
        fontSize: 11
    },
    warningText: {
        marginTop: 4,
        color: theme.DANGER_COLOR,
        fontSize: 11
    }
});