import Constants, { AppOwnership } from 'expo-constants';
import { iosClientId, androidClientId } from '../../constants/Keys';
import { Platform } from 'react-native';
import * as Google from 'expo-google-app-auth';
import * as GoogleSignIn from 'expo-google-sign-in';
import firebase from 'firebase';
import { signInWithFacebook } from './facebookAuth';
import { authResult } from '../../models/auth';

export const signInWithGoogle = 
    async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    if(Constants.appOwnership === AppOwnership.Expo){
        return _signInWithGoogleExpo(failedCredential);
    } else {
        return _signInWithGoogleAuth(failedCredential);
    }
}

const _signInWithGoogleAuth = async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    let result;
    let clientId = Platform.OS === 'android' ? androidClientId : iosClientId;
    try{
        await GoogleSignIn.initAsync({
            clientId: clientId, 
            scopes: ['profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly']
        });

        result = await GoogleSignIn.signInAsync();
    } catch(error){
        // User cancelled
        if(error.code == '-3'){
            return { type: 'cancel', message: 'User cancelled Google login' };
        } else {
            throw error;
        }
    }

    const { type, user } = result;

    if(type === 'cancel'){
        return { type: 'cancel', message: 'User cancelled Google login' };
    }

    if(user && user.auth){
        return _handleAuthTypeSuccess(user.auth.idToken, user.auth.accessToken, failedCredential);
    } else {
        return Promise.reject("Invalid user received from Google sign in");
    }
}

const _signInWithGoogleExpo = async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    let result: Google.LogInResult;
    let clientId = Platform.OS === 'android' ? androidClientId : iosClientId;
    try{
        result = await Google.logInAsync({
            clientId: clientId,
            // behavior: 'web',
            scopes: ['profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly']
        });
    } catch(error){
        // User cancelled
        if(error.code == '-3'){
            return { type: 'cancel', message: 'User cancelled Google login' };
        } else {
            throw error;
        }
    }

    if(result.type === 'success')
    {
        return _handleAuthTypeSuccess(result.idToken, result.accessToken, failedCredential);
    } else {
        return { type: 'cancel', message: 'User cancelled Google login' };
    }
}

const _handleAuthTypeSuccess = async (
    idToken: string | null | undefined,
    accessToken: string | null | undefined,
    failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {

    let firebaseUser;

    try{
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
        const oAuthCred = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken); //TODO: store token for API usage?
        const userCred = await firebase.auth().signInWithCredential(oAuthCred);  // Sign in with Google credential
        firebaseUser = userCred.user;
    } catch(error){
        var errorCode = error.code;
        if (errorCode === 'auth/account-exists-with-different-credential') {
            // TODO: Convert alert to toast or modal
            alert(`Email already associated with another account. Let's link your Facebook account.`);
            return signInWithFacebook(error.credential);
        } else {
            throw error;
        }
    }

    if(failedCredential && firebaseUser){
        await firebaseUser.linkWithCredential(failedCredential);
    }

    if(firebaseUser){
        return firebaseUser;
    } else {
        return Promise.reject("Failed to sign in with Google");
    }
}