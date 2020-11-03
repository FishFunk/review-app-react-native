import React, { Component } from 'react';
import { 
    Modal, 
    View, 
    StyleSheet, 
    Dimensions, 
    NativeSyntheticEvent, 
    TextInputKeyPressEventData, 
    Keyboard } from 'react-native';
import { 
    Button, 
    Text, 
    Form, 
    Item, 
    Textarea, 
    Label, 
    Toast,
    Root,
    Spinner,
    CheckBox
} from 'native-base'
import theme from '../styles/theme';
import FirebaseService from '../services/firebaseService';
import _indexOf from 'lodash/indexOf';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { reviewSummary } from '../models/reviews';

export default class ReportModal extends Component<{ 
        showModal: boolean, 
        onDismissModal: ()=>any,
        review: reviewSummary
    },
    {
        comments: string,
        submittingReport: boolean,
        checkbox1: boolean,
        checkbox2: boolean,
        checkbox3: boolean
    }> {

    constructor(props: any){
        super(props);
        this.state = {
            comments: '',
            submittingReport: false,
            checkbox1: false,
            checkbox2: false,
            checkbox3: false
        }
    }

    onDismissModal(){
        Keyboard.dismiss();
        this.props.onDismissModal();
    }

    onEditComment(text: string){
        this.setState({ comments: text });
    }

    onPressCheckbox1(){
        this.setState({ checkbox1: !this.state.checkbox1 })
    }

    onPressCheckbox2(){
        this.setState({ checkbox2: !this.state.checkbox2 })
    }

    onPressCheckbox3(){
        this.setState({ checkbox3: !this.state.checkbox3 })
    }

    onKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>){
        if(e.nativeEvent.key === 'Enter'){
            e.preventDefault();
            Keyboard.dismiss();
        }
    }

    async onSubmitForm(){
        Keyboard.dismiss();

        const { review } = this.props;
        const { checkbox1, checkbox2, checkbox3, comments } = this.state;

        if(!checkbox1 && !checkbox2 && !checkbox3){
            Toast.show({
                position: 'bottom',
                text: 'Please select one or more reasons for reporting this review.',
                duration: 3000,
                buttonText: 'Ok'
            });
            return;
        }

        const reportData = {
            reporter_id: FirebaseService.getCurrentUserId(),
            reviewer_id: review.reviewer_id,
            place_id: review.place_id,
            reviewer_name: review.name,
            date: new Date().toDateString(),
            report_reasons: `${checkbox1 ? ' Offensive ' : ''}${checkbox2 ? ' Inappropriate ' : ''}${checkbox3 ? ' Fake/Spam ' : ''}`,
            report_comments: comments,
            review_key: review.review_key
        }

        this.setState({ submittingReport: true });

        await FirebaseService.submitReviewReport(reportData);
        
        // Reset state
        this.setState({ 
            submittingReport: false, 
            checkbox1: false, 
            checkbox2: false, 
            checkbox3: false,
            comments: '' });

        this.onDismissModal();
    }

    render(){
        const { showModal } = this.props;
        return (
        <Modal
            visible={showModal}
            animationType={'fade'}
            transparent={true}
        >
            <Root>
            <View style={{height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                <View style={styles.modalView}>
                    <View>
                        <Text style={styles.title}>Report Review</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <Form style={styles.form}>
                            <View style={styles.checkBoxWrapper}>
                                <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>this.onPressCheckbox1()}>
                                    <CheckBox color={theme.PRIMARY_COLOR} checked={this.state.checkbox1} />
                                    <Text style={styles.checkboxLabel}>Offensive</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>this.onPressCheckbox2()}>
                                    <CheckBox color={theme.PRIMARY_COLOR} checked={this.state.checkbox2} />
                                    <Text style={styles.checkboxLabel}>Inappropriate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>this.onPressCheckbox3()}>
                                    <CheckBox color={theme.PRIMARY_COLOR} checked={this.state.checkbox3}/>
                                    <Text style={styles.checkboxLabel}>Fake/Spam</Text>
                                </TouchableOpacity>
                            </View>
                            <Item stackedLabel style={styles.textAreaItem}>
                                <Label>Comments</Label>
                                <Label style={styles.sublabel}>up to 100 characters</Label>
                                <Textarea 
                                    returnKeyType='done'
                                    onKeyPress={this.onKeyPress.bind(this)}
                                    value={this.state.comments}
                                    maxLength={100}
                                    multiline={true}
                                    onChangeText={this.onEditComment.bind(this)}
                                    style={styles.textArea} 
                                    rowSpan={4} 
                                    bordered={false} 
                                    underline={false}/>
                            </Item>
                        </Form>
                    </View>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity onPress={this.onDismissModal.bind(this, false)} disabled={this.state.submittingReport}> 
                            <Button style={styles.cancelButton}>
                                <Text>Cancel</Text>
                            </Button>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onSubmitForm.bind(this)} disabled={this.state.submittingReport}> 
                            <Button style={styles.submitButton}>
                                {
                                    this.state.submittingReport ? 
                                        <Spinner color={theme.LIGHT_COLOR} size={12} style={{width: 80}}/> : 
                                        <Text>Submit</Text>
                                }
                            </Button>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            </Root>
        </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalView: {
        marginTop: Dimensions.get('screen').height / 4,
        marginLeft: 5,
        marginRight: 5,
        height: Dimensions.get('screen').height / 2,
        backgroundColor: theme.LIGHT_COLOR,
        padding: 10,
        alignItems: "center",
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
    checkBoxWrapper: {
        flexDirection: 'row', 
        marginTop: 10, 
        marginBottom: 10
    },
    title: {
        fontSize: 24,
        color: theme.DARK_COLOR 
    },
    checkboxLabel: {
        fontSize: 14, 
        marginLeft: 14, 
        marginTop: 1,
        color: theme.DARK_COLOR
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
    buttonGroup: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    submitButton: {
        backgroundColor: theme.PRIMARY_COLOR
    },
    cancelButton: {
        backgroundColor: theme.DANGER_COLOR
    },
    formContainer: {
        width: '100%',
        padding: 10
    },
    form: {
        width: '100%'
    },
    sublabel: {
        fontSize: 12,
        fontWeight: '200'
    }
})
