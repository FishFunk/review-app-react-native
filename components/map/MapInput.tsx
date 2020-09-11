import React from 'react';
import PlacesInput from 'react-native-places-input';
import { searchPlace } from '../../models/place';

class MapInput extends React.Component<
    { handleSelectPlace: (place: searchPlace)=>void, apiKey: string }> {

    render() {
        return (
            <PlacesInput
                googleApiKey={this.props.apiKey}
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