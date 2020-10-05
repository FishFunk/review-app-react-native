import React from 'react';
import PlacesInput from 'react-native-places-input';
import { searchPlace } from '../../models/place';
import theme from '../../styles/theme';

class MapInput extends React.Component<
    { 
        handleSelectPlace: (place: searchPlace)=>void, 
        apiKey: string,
        handleGenericSearch?: ()=> void
    },
    {
        value: string
    }> {

    state = {
        value: ''
    }

    placesInputRef = null;

    onSubmitEditing(){
        // TODO: Search map with plain query
    }

    onChangeText(val: string){
        this.setState({value: val});
        if(val.length === 0){
            this.placesInputRef.setState({places: []});
        }
    }

    setMapInputRef(ref: any){
        this.placesInputRef = ref;
    }

    render() {
        return (
            <PlacesInput
                ref={(ref: any) => this.setMapInputRef(ref)}
                googleApiKey={this.props.apiKey}
                placeHolder={"Search for places"}
                language={"en-US"}
                onSelect={(place: searchPlace) => {
                    this.props.handleSelectPlace(place);
                }}
                query={this.state.value}
                clearQueryOnSelect={true}
                requiredCharactersBeforeSearch={2}
                stylesItemText={{color: theme.DARK_COLOR}}
                onChangeText={this.onChangeText.bind(this)}
                textInputProps={{
                    color: theme.DARK_COLOR,
                    placeholderTextColor: 'rgba(53, 64, 70, 0.7)',
                    autoFocus: false,
                    clearButtonMode: 'always',
                    returnKeyType: 'search',
                    onSubmitEditing: this.onSubmitEditing.bind(this)
                }}
            />
        )
    }
}

export default MapInput;