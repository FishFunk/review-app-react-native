import React from 'react';
import PlacesInput from 'react-native-places-input';
import { GOOGLE_API_KEY } from '../../constants/Keys';
import { searchPlace } from '../../models/place';

class MapInput extends React.Component<{ handleSelectPlace: (place: searchPlace)=>{} }> {

    render() {
        return (
            <PlacesInput
                googleApiKey={GOOGLE_API_KEY}
                placeHolder={"Find a place"}
                language={"en-US"}
                onSelect={(place: searchPlace) => {
                    this.props.handleSelectPlace(place);
                }}
                clearQueryOnSelect={true}
                requiredCharactersBeforeSearch={2}
                textInputProps={{
                    autoFocus: false,
                    clearButtonMode: 'always'
                }}
            />
        )
    }
}

export default MapInput;