import React from "react";
import { Dimensions, StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import theme from "../../styles/theme";
import { Body, Button, Content, Icon, Label, List, ListItem, Right, Text, Title, View } from "native-base";
import { dbPlace } from "../../models/place";
import { ScrollView } from "react-native-gesture-handler";
import ReviewStars from "../reviews/ReviewStars";

export default class PlaceListModal extends React.Component<
    { 
        isOpen: boolean, 
        places: dbPlace[], 
        onDismissModal: () => any,
        onShowPlaceDetails: (placeId: string) => any
    }>{

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
                    <View style={styles.container}>
                        <Title>Nearby Places</Title>
                        <ScrollView>
                            <List style={styles.list}>
                            {
                                this.props.places.map((place: dbPlace, idx: number)=> 
                                    <ListItem avatar key={idx}>
                                        <Body>
                                            <Text>{place.name}</Text>
                                            <ReviewStars rating={place.rating} fontSize={18} />
                                        </Body>
                                        <Right>
                                            <Button 
                                                small
                                                transparent
                                                onPress={this.props.onShowPlaceDetails.bind(this, place.id)}>
                                                <Icon 
                                                    style={{fontSize: 18, color: theme.PRIMARY_COLOR}}
                                                    type={'FontAwesome5'} 
                                                    name={'info-circle'}></Icon>
                                            </Button>
                                        </Right>
                                    </ListItem>
                                )
                            }
                            </List>
                        </ScrollView>
                    </View>
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
    list: {
        paddingRight: 5
    }
});