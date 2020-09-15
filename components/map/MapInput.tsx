import React from 'react';
import PlacesInput from 'react-native-places-input';
import { searchPlace } from '../../models/place';
import theme from '../../styles/theme';

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
                stylesItemText={{color: theme.DARK_COLOR}}
                textInputProps={{
                    color: theme.DARK_COLOR,
                    placeholderTextColor: 'rgba(53, 64, 70, 0.7)',
                    autoFocus: false,
                    clearButtonMode: 'always'
                }}
            />
        )
    }
}

export default MapInput;