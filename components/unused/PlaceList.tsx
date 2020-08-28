import React, { Component } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { ListItem, Text } from "react-native-elements";
import { Container, Content } from "native-base";
import { StyleSheet } from "react-native";

const GOOGLE_API_KEY = 'AIzaSyDVrAmdPezu02UdtZmstHbL7Sv-icgJ0u4';

//Components
import ReviewStars from "./ReviewStars";

export default class PlaceList extends Component<{places: any}> {
  render() {
    const { places } = this.props;
    const baseImage =
      "https://images.unsplash.com/photo-1552334405-4929565998d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80";
    return (
      <Container style={styles.container}>
        <Content>
          {places.length <= 0 && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {places.length > 0 && (
            <FlatList
              data={places}
              renderItem={({ item }) => (
                <TouchableOpacity>
                  <ListItem
                    key={item.id}
                    title={
                      <View style={styles.rowDirection}>
                        <Text>{item.name}</Text>
                        <Text>1.4km</Text>
                      </View>
                    }
                    subtitle={
                      item.rating && (
                        <View>
                          <View style={styles.startReviewsContainer}>
                            <ReviewStars rating={item.rating} />
                            <Text>{item.rating.toFixed(1)}</Text>
                          </View>
                          <View>
                            <Text>{item.vicinity}</Text>
                          </View>
                        </View>
                      )
                    }
                    leftAvatar={{
                      rounded: false,
                      size: "large",
                      source: item.photos && {
                        uri:
                          item.photos.length > 0
                            ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${item.photos[0].photo_reference}&sensor=false&maxheight=${item.photos[0].height}&maxwidth=${item.photos[0].width}&key=${GOOGLE_API_KEY}`
                            : baseImage
                      }
                    }}
                    bottomDivider
                    chevron={{ color: "#e90000", size: 30 }}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
            />
          )}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  chevron: {
    color: "#e90000"
  },
  rowDirection: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  startReviewsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center"
  }
});