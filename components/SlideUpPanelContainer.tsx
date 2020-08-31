import React from "react";
import { StyleSheet, View } from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import PlaceDetails from "./map/PlaceDetails";

export default class SlideUpPanelContainer extends React.Component<
    {isOpen: boolean, placeId: string, toggleSlideUpPanel: Function}> {
    _panel: any;

    componentDidUpdate(prevProps: any){
        if(this._panel){
            if(this.props.isOpen === true && 
                prevProps.isOpen !== this.props.isOpen) {
                this._panel.show();
            } else if (this.props.isOpen === false && 
                prevProps.isOpen !== this.props.isOpen) {
                this._panel.hide();
            }
        }
    }

    render(){
        return (
            <SlidingUpPanel ref={c => (this._panel = c)}>
                {dragHandler => (
                    <View style={styles.container}>
                        <PlaceDetails 
                            placeId={this.props.placeId} 
                            dragHandler={dragHandler} 
                            toggleSlideUpPanel={this.props.toggleSlideUpPanel}/>
                    </View>
                )}
            </SlidingUpPanel>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white'
  }
});