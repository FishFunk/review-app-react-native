import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { 
  Text, 
  Button, 
  Grid,
  Row,
  Col,
  Spinner,
  Label,
  Title,
  Footer} from 'native-base';
import FirebaseService from '../../services/firebaseService';
import theme from '../../styles/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { appUser } from '../../models/user';

export default class ProfileContainer extends React.Component<{},{
    user: appUser
}> {
  
    state: any = { user: {} };

    onLogout(){
        FirebaseService.signOut();
    }

    componentDidMount(){
        this.load()
            .catch(error => console.error(error));
    }

    async load(){
        const currentUser = await FirebaseService.getUser();


        this.setState({ user: currentUser });
    }

    getPhotoUrl(){
        if(this.state.user && this.state.user.photoUrl){
            const { photoUrl } = this.state.user;
            if(photoUrl.indexOf('facebook') >= 0){
                return `${photoUrl}?type=large`;
            } else {
                return photoUrl;
            }
        } else {
            return '';
        }
    }

    render(){
        if(!this.state.user){
            return <Spinner color={theme.PRIMARY_COLOR} />
        }
        return (
            <ScrollView style={styles.container}>
                <Grid>
                    <Row style={styles.row}>
                        <Image 
                            style={styles.profileImage}
                            source={{uri: this.getPhotoUrl()}} 
                            defaultSource={require('../../assets/images/profile.png')} />
                    </Row>
                    <Row style={styles.row}>
                        <Title style={styles.title}>{this.state.user.firstName} {this.state.user.lastName}</Title>
                    </Row>
                    <Row style={styles.row}>
                        <Label>Review Count: </Label><Text>{
                            this.state.user.reviews? this.state.user.reviews.length :  0}</Text>
                    </Row>
                    <Row style={styles.row}></Row>
                    <Row style={styles.row}></Row>
                    <Row style={styles.row}></Row>
                    <Row style={styles.row}>
                        <Button transparent onPress={this.onLogout} style={{alignSelf: 'center'}}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </Button>
                    </Row>
                </Grid>
            </ScrollView>
        )};
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%'
    },
    title: {
        fontSize: 30,
        color: theme.DARK_COLOR
    },
    profileImage: {
        marginTop: 10,
        marginBottom: 10,
        width: 150,
        height: 150,
        borderRadius: 150
    },
    row: {
        justifyContent: "center",
        flexDirection: 'row',
        minHeight: 60
    },
    buttonContainer: {
        flex: 1,
        justifyContent: "space-evenly",
        flexDirection: 'row'
    },
    buttonText: {
        color: theme.DANGER_COLOR
    }
});