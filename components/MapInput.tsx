import React from 'react';
import PlacesInput from 'react-native-places-input';

class MapInput extends React.Component<{ handleSelectPlace: Function }> {

    render() {
        return (
            <PlacesInput
                googleApiKey={'AIzaSyDVrAmdPezu02UdtZmstHbL7Sv-icgJ0u4'}
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