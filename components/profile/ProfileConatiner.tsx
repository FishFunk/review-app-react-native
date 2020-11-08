import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { 
  Text, 
  Button, 
  Row,
  Title,
  Icon, 
  View,
  Label} from 'native-base';
import FirebaseService from '../../services/firebaseService';
import theme from '../../styles/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { appUser } from '../../models/user';
import SpinnerContainer from '../SpinnerContainer';
import PhoneVerifyRecaptcha from '../PhoneVerifyRecaptcha';
import LicenseAgreementModal from '../LicenseAgreementModal';

export default class ProfileContainer extends React.Component<{navigation: any},{
    user: appUser, 
    emailSent: boolean, 
    isModalOpen: boolean, 
    verificationSteps: {
        email_verified: boolean,
        phone_verified: boolean,
        review_verified: boolean
    }
}> {
  
    state: any = { 
        user: {}, 
        emailSent: false, 
        isModalOpen: false,
        verificationSteps: {
            email_verified: false,
            phone_verified: false,
            review_verified: false
        }
    };

    componentDidMount(){
        this.load()
            .catch(error => console.error(error));
    }

    onLogout(){
        FirebaseService.signOut();
    }

    showModal(){
        this.setState({ isModalOpen: true });
    }

    onDismissModal(){
        this.setState({ isModalOpen: false });
    }

    async load(){

        const currentUser = await FirebaseService.getUser();
        const verificationSteps = {
            email_verified: currentUser.email_verified,
            phone_verified: currentUser.phone_verified,
            review_verified: currentUser.reviews?.length > 0
        };

        this.setState({ user: currentUser, verificationSteps: verificationSteps });
    }

    async sendVerificationEmail(){
        await FirebaseService.sendUserEmailVerification();
        this.setState({ emailSent: true });
    }

    getPhotoUrl(){
        if(this.state.user && this.state.user.photoUrl){
            const { photoUrl } = this.state.user;
            if(photoUrl.indexOf('facebook') >= 0){
                return `${photoUrl}?type=large`;
            } else if (photoUrl.indexOf('google')){
                const idx = photoUrl.indexOf('=s');
                const url = photoUrl.slice(0, idx);
                return `${url}=s500`;
            } else {
                return photoUrl;
            }
        } else {
            return '';
        }
    }

    onRecaptchaSuccess(){
        this.load();
    }

    getImageStyle(){
        let stepsComplete = 0;
        const { email_verified, phone_verified, review_verified } = this.state.verificationSteps;

        if(email_verified){
            stepsComplete++;
        }
        if(phone_verified){
            stepsComplete++;
        }
        if(review_verified){
            stepsComplete++;
        }

        switch(stepsComplete){
            case(3):
                return styles.fullyVerified;
            case(2):
                return styles.almostVerified;
            case(1):
                return styles.partialVerified;
            default:
                return styles.notVerified;
        }
    }

    allVerifcationStepsComplete(){
        const { email_verified, phone_verified, review_verified } = this.state.verificationSteps;
        return (email_verified && phone_verified && review_verified);
    }

    render(){
        if(!this.state.user){
            return <SpinnerContainer/>
        }
        return (
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.row}>
                    <View style={this.getImageStyle()}>
                        <Image 
                            style={styles.profileImage}
                            source={{uri: this.getPhotoUrl()}} 
                            defaultSource={require('../../assets/images/profile.png')} />
                    </View>
                    {
                        <View style={{ position: 'absolute', top: 10 }}>
                            <Icon style={{
                                fontSize: 40,
                                color: theme.STAR_COLOR,
                                alignSelf: 'center' }} name={'award'} type={'FontAwesome5'}></Icon>
                        </View>
                    }
                </View>
                <View style={styles.row}>
                    <Title style={styles.title}>{this.state.user.firstName} {this.state.user.lastName}</Title>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Review Count</Text>
                    <Text style={styles.text}>{this.state.user.reviews? this.state.user.reviews.length : 0}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Email Verified</Text>
                    {           
                        this.state.user.email_verified ?             
                            <Icon type={'FontAwesome5'} name={'check'} 
                                fontSize={16} style={styles.verifiedIcon}></Icon> :
                            <Icon type={'FontAwesome5'} name={'times'} 
                                style={styles.notVerifiedIcon}></Icon>
                    }
                </View>
                {
                    !this.state.user.email_verified ? 
                        <Row style={styles.row}>
                            {        
                                !this.state.emailSent ?                         
                                <Button full transparent onPress={this.sendVerificationEmail.bind(this)}>
                                    <Text>Resend Email Verification Link</Text>
                                </Button> : 
                                <Text>Email Sent!</Text>
                            }
                        </Row> : null
                }
                <View style={styles.row}>
                    <Text style={styles.label}>Phone Verified</Text>
                    {           
                        this.state.user.phone_verified ?             
                            <Icon type={'FontAwesome5'} name={'check'} 
                                fontSize={16} style={styles.verifiedIcon}></Icon> :
                            <Icon type={'FontAwesome5'} name={'times'} 
                                style={styles.notVerifiedIcon}></Icon>
                    }
                </View>
                {
                    !this.state.user.phone_verified ? 
                    <View style={styles.row}>
                        <PhoneVerifyRecaptcha onSuccess={this.onRecaptchaSuccess.bind(this)}/>
                    </View> : null
                }
                <View style={styles.row}>
                    <Text style={styles.label}>Wrote a Review</Text>
                    {           
                        this.state.verificationSteps.review_verified ?             
                            <Icon type={'FontAwesome5'} name={'check'} 
                                fontSize={16} style={styles.verifiedIcon}></Icon> :
                            <Icon type={'FontAwesome5'} name={'times'} 
                                style={styles.notVerifiedIcon}></Icon>
                    }
                </View>
                <Button transparent onPress={this.onLogout} style={styles.logoutBtn}>
                    <Text style={styles.buttonText}>Logout</Text>
                </Button>
                <Button transparent onPress={this.showModal.bind(this)} style={styles.logoutBtn}>
                    <Text style={{fontSize: 12}}>License Agreement</Text>
                </Button>
                <LicenseAgreementModal onDismissModal={this.onDismissModal.bind(this)} isOpen={this.state.isModalOpen}/>
            </ScrollView>
        )};
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },
    title: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 30,
        color: theme.DARK_COLOR
    },
    label: {
        // fontWeight: 'bold',
        // fontSize: 18
    },
    text: {
        fontSize: 20
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 150
    },
    row: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        minHeight: 60
    },
    buttonText: {
        color: theme.DANGER_COLOR
    },
    verifiedIcon: {
        color: theme.PRIMARY_COLOR,
        fontSize: 20
    },
    notVerifiedIcon: {
        color: theme.DANGER_COLOR,
        fontSize: 20
    },
    logoutBtn: {
        alignSelf: 'center',
        marginTop: '10%'
    },
    // Account created - need to verify email, phone, and write a review
    notVerified: {
        marginTop: 10,
        borderWidth: 5,
        borderRadius: 150,
        borderTopColor: theme.PRIMARY_COLOR,
        borderRightColor: theme.LIGHT_COLOR,
        borderBottomColor: theme.LIGHT_COLOR,
        borderLeftColor: theme.LIGHT_COLOR
    },
    // 1 out of 3 verification steps complete
    partialVerified: {
        marginTop: 10,
        borderWidth: 5,
        borderRadius: 150,
        borderTopColor: theme.PRIMARY_COLOR,
        borderRightColor: theme.PRIMARY_COLOR,
        borderBottomColor: theme.LIGHT_COLOR,
        borderLeftColor: theme.LIGHT_COLOR
    },
    // 2 out of 3 verification steps complete
    almostVerified: {
        marginTop: 10,
        borderWidth: 5,
        borderRadius: 150,
        borderTopColor: theme.PRIMARY_COLOR,
        borderRightColor: theme.PRIMARY_COLOR,
        borderBottomColor: theme.PRIMARY_COLOR,
        borderLeftColor: theme.LIGHT_COLOR
    },
    // Completed all 3 verification steps
    fullyVerified: {
        marginTop: 10,
        borderWidth: 5,
        borderRadius: 150,
        borderTopColor: theme.PRIMARY_COLOR,
        borderRightColor: theme.PRIMARY_COLOR,
        borderBottomColor: theme.PRIMARY_COLOR,
        borderLeftColor: theme.PRIMARY_COLOR
    }
});