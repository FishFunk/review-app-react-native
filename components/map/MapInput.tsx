import React from 'react';
import PlacesInput from 'react-native-places-input';
import { searchPlace } from '../../models/place';
import theme from '../../styles/theme';

class MapInput extends React.Component<
    { 
        handleSelectPlace: (place: searchPlace)=>any, 
        handleGenericSearch: (query: string)=>any,
        apiKey: string
    },
    {
        submitting: boolean
    }> {

    state = {
        submitting: false
    }

    placesInputRef = null;

    onSubmitEditing(event: any){
        event?.preventDefault();

        if(this.placesInputRef){
            if(this.placesInputRef.state.query.length > 0 && !this.state.submitting){
                this.setState({ submitting: true });
                this.props.handleGenericSearch(this.placesInputRef.state.query);
                this.placesInputRef.setState({ places: [], showList: false });

                setTimeout(()=>{
                    this.placesInputRef.setState({ places: [], showList: false });
                    this.setState({ submitting: false });
                }, 1000)
            }
        }
    }

    onChangeText(val: string){
        if(this.placesInputRef){
            if(this.placesInputRef.state.query == '' || this.state.submitting){
                this.placesInputRef.setState({ places: [], showList: false });
            }
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
                clearQueryOnSelect={true}
                requiredCharactersBeforeSearch={2}
                requiredTimeBeforeSearch={500}
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