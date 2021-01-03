import React, { Component } from 'react';
import { Modal, View, StyleSheet, Dimensions, NativeSyntheticEvent, TextInputKeyPressEventData, Keyboard } from 'react-native';
import { 
    Button, 
    Form, 
    Item, 
    Label, 
    Spinner, 
    Text,
    Textarea
} from 'native-base'
import ConfettiCannon from 'react-native-confetti-cannon';
import theme from '../../styles/theme';
import FadeInView from '../animations/FadeIn';
import _random from 'lodash/random';
import FirebaseService from '../../services/firebaseService';
import SpinnerContainer from '../SpinnerContainer';

export default class ReviewComplete extends Component<{ 
        showModal: boolean, 
        onDismissModal: ()=>void
    },
    {
        comments: string,
        title: string,
        message: string,
        submitting: boolean
    }> {

    state = { comments: '', title: '', message: '', submitting: false };

    titles = ['Nice!', `Ta da!`, 'Voila!'];
    messages = [
        'Thank you for improving our community one review at a time!',
        'Your review is now live!',
        `Thanks for posting a reivew. Your opinion matters!`
    ];

    componentDidMount(){
        const title = this.titles[_random(0, 2)];
        const msg = this.messages[_random(0, 2)];

        this.setState({ title: title, message: msg });
    }

    onEditComment(text: string){
        this.setState({ comments: text });
    }

    onKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>){
        if(e.nativeEvent.key === 'Enter'){
            e.preventDefault();
            Keyboard.dismiss();
        }
    }

    async onSubmitFeedback(){
        this.setState({ submitting: true });

        const data = {
            userId: FirebaseService.getCurrentUserId(),
            name: FirebaseService.auth.currentUser?.displayName,
            feedback: this.state.comments,
            date: new Date().toDateString()
        };

        await FirebaseService.submitFeedback(data);

        this.setState({ submitting: false });
        this.props.onDismissModal();
    }

    render(){
        const { showModal, onDismissModal } = this.props;
        return (
        <Modal
            onDismiss={onDismissModal}
            visible={showModal}
            animationType={'slide'}
            transparent={true}
        >
            <View style={styles.modalView}>
                <ConfettiCannon count={200} origin={{x: 100, y: 0}} autoStartDelay={300} />
                <Text style={styles.bigText}>{this.state.title}</Text>
                <Text style={styles.regularText}>
                    {this.state.message}
                </Text>
                <Form style={{ width: '100%', padding: 20 }}>
                    <Item stackedLabel style={styles.textAreaItem}>
                        <Label>Enjoying our app (or not)? Send us some feedback!</Label>
                        <Label style={styles.sublabel}>up to 150 characters</Label>
                        <Textarea 
                            returnKeyType='done'
                            onKeyPress={this.onKeyPress.bind(this)}
                            value={this.state.comments}
                            maxLength={150}
                            multiline={true}
                            onChangeText={this.onEditComment.bind(this)}
                            style={styles.textArea} 
                            rowSpan={4} 
                            bordered={false} 
                            underline={false}/>
                    </Item>
                </Form>
                <FadeInView style={styles.buttonGroup} delay={1000}>
                    <Button 
                        disabled={this.state.submitting || this.state.comments.length < 1}
                        style={ this.state.comments.length < 1 ? styles.feedbackBtnDisabled : styles.feedbackBtn } 
                        onPress={this.onSubmitFeedback.bind(this)}>
                        {
                            this.state.submitting ? 
                                <SpinnerContainer color={theme.LIGHT_COLOR}/> :
                                <Text style={styles.btnText}>Submit Feedback</Text>
                        }
                    </Button>
                    <Button 
                        style={{backgroundColor: theme.PRIMARY_COLOR}} 
                        onPress={onDismissModal}>
                        <Text style={styles.btnText}>Close</Text>
                    </Button>
                </FadeInView>
            </View>
        </Modal>
        )
    }
}

const styles=StyleSheet.create({
    modalView: {
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        backgroundColor: theme.LIGHT_COLOR,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    bigText: {
        color: theme.DARK_COLOR,
        textAlign: 'center',
        fontSize: 56,
        fontFamily: theme.fontBold
    },
    regularText: {
        color: theme.DARK_COLOR,
        padding: 10,
        fontSize: 24,
        textAlign: 'center'
    },
    buttonGroup: {
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    textAreaItem: {
        borderBottomWidth: 0
    },
    textArea: {
        marginTop: 15,
        width: '100%',
        borderWidth: 0.5,
        borderColor: theme.DARK_COLOR
    },
    sublabel: {
        fontSize: 12,
        fontWeight: '200'
    },
    feedbackBtn: {
        backgroundColor: theme.SECONDARY_COLOR,
        width: 160
    },
    feedbackBtnDisabled: {
        backgroundColor: theme.SECONDARY_COLOR,
        opacity: 0.6,
        width: 160
    },
    btnText: {
        textAlign: 'center', 
        color: theme.LIGHT_COLOR
    }
})
