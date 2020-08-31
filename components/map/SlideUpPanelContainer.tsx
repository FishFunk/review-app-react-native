import React from "react";
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';

export default class SlideUpPanelContainer extends React.Component<{isOpen: boolean}> {
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
            <SlidingUpPanel ref={c => (this._panel = c)} showBackdrop={false}>
                {dragHandler => (
                    <View style={styles.container}>
                        <View style={styles.draggable} {...dragHandler}>
                            <Text>Drag handler</Text>
                        </View>
                    <ScrollView>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                        <Text>Here is the content inside panel</Text>
                    </ScrollView>
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
    zIndex: 999,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  draggable: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  }
});