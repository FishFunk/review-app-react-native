import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

class MapInput extends React.Component<{ notifyChange: Function }> {

    render() {
        return (
            <GooglePlacesAutocomplete
                textInputProps={{}}
                placeholder='Find a place'
                minLength={2}
                autoFocus={false}
                returnKeyType={'search'}
                listViewDisplayed={true}
                fetchDetails={true}
                onFail={error => console.error(error)}
                onPress={(data, details = null)=>{
                    console.log(data);
                    console.log(details);
                    this.props.notifyChange(data, details ? details.geometry.location : null);
                }}
                query={{
                    key: 'AIzaSyDVrAmdPezu02UdtZmstHbL7Sv-icgJ0u4',
                    language: 'en'
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={200}
            />
        )
    }
}

export default MapInput;