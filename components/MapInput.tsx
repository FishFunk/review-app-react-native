import React from 'react';
import PlacesInput from 'react-native-places-input';

class MapInput extends React.Component<{ handleSelectPlace: Function }> {

    render() {
        return (
            <PlacesInput
                googleApiKey={'AIzaSyCASruS9jkUVVJ8E2rk7ga5qRezbIYtj7s'}
                placeHolder={"Find a place"}
                language={"en-US"}
                onSelect={(place: any) => {
                    this.props.handleSelectPlace(place);
                }}
            />
        )
    }
}

export default MapInput;