import React from 'react';
import PlacesInput from 'react-native-places-input';
import { GOOGLE_API_KEY } from '../../constants/Keys';

class MapInput extends React.Component<{ handleSelectPlace: Function }> {

    render() {
        return (
            <PlacesInput
                googleApiKey={GOOGLE_API_KEY}
                placeHolder={"Find a place"}
                language={"en-US"}
                onSelect={(place: any) => {
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