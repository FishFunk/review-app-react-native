import React, { Component } from 'react';
import { 
    Icon, 
    Button, 
    View, 
    Label
} from "native-base";
import theme from '../../styles/theme';
import { ScrollView, StyleSheet } from 'react-native';

export default class MapQuickSearchButtons extends Component<{
    onQuickSearch: (queryOrType: string) => any
},{}> {

    render(){
        // let possibleTypes: 'bar' | 'cafe' | 'tourist_attraction' | 'spa' | 
        //     'shopping_mall' | 'shoe_store' | 'restaurant' | 'park' | 'night_club'|
        //     'meal_delivery' | 'meal_takeaway' | 'lodging' | 'liquor_store' | 'pharmacy' | 'hair_care';

        const { onQuickSearch } = this.props;
        return(
            <View style={styles.exploreButtonContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollView}>                                        
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('bar')}>
                        <Icon type={'FontAwesome5'} name={'cocktail'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Drinks</Label>
                    </Button>
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('restaurant')}>
                        <Icon type={'FontAwesome5'} name={'utensils'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Dining</Label>
                    </Button>
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('meal_delivery')}>
                        <Icon type={'FontAwesome5'} name={'pizza-slice'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Delivery</Label>
                    </Button>
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('cafe')}>
                        <Icon type={'FontAwesome5'} name={'mug-hot'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Cafes</Label>
                    </Button>
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('hair_care')}>
                        <Icon type={'FontAwesome5'} name={'cut'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Hair Care</Label>
                    </Button>
                </ScrollView>
            </View>
        )}
}

const styles = StyleSheet.create({
    exploreButtonContainer: {
        alignItems: 'center',
        position: 'absolute',
        top: 60,
        width: '100%',
        zIndex: 9998
    },
    scrollView: {
        paddingLeft: 10,
        paddingRight: 10
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