import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { 
  Text, 
  Button, 
  Grid,
  Row,
  Title,
  Icon, 
  View} from 'native-base';
import FirebaseService from '../../services/firebaseService';
import theme from '../../styles/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { appUser } from '../../models/user';
import SpinnerContainer from '../SpinnerContainer';
import PhoneVerifyRecaptcha from '../PhoneVerifyRecaptcha';
import LicenseAgreementModal from '../LicenseAgreementModal';

export default class ProfileContainer extends React.Component<{navigation: any},{
    user: appUser, emailSent: boolean, isModalOpen: boolean
}> {
  
    state: any = { user: {}, emailSent: false, isModalOpen: false  };

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
        this.setState({ user: currentUser });
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

    render(){
        if(!this.state.user){
            return <SpinnerContainer/>
        }
        return (
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.row}>
                    <Image 
                        style={styles.profileImage}
                        source={{uri: this.getPhotoUrl()}} 
                        defaultSource={require('../../assets/images/profile.png')} />
                </View>
                <View style={styles.row}>
                    <Title style={styles.title}>{this.state.user.firstName} {this.state.user.lastName}</Title>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Review Count: </Text>
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
                <View style={styles.row}>
                {
                    !this.state.user.phone_verified ? 
                        <PhoneVerifyRecaptcha onSuccess={this.onRecaptchaSuccess.bind(this)}/> : null
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
        marginTop: 10,
        marginBottom: 10,
        width: 150,
        height: 150,
        borderRadius: 150
    },
    row: {
        justifyContent: "space-evenly",
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
    }
});