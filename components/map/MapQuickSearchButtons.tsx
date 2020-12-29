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
                        onPress={()=>onQuickSearch('meal_takeaway')}>
                        <Icon type={'FontAwesome5'} name={'hamburger'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Takeout</Label>
                    </Button>
                    <Button small rounded style={styles.exploreButton} iconLeft
                        onPress={()=>onQuickSearch('cafe')}>
                        <Icon type={'FontAwesome5'} name={'mug-hot'} style={styles.exploreIcon}></Icon>
                        <Label style={styles.exploreLabel}>Cafes</Label>
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
        justifyContent: 'center',
        width: '100%'
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