import firebase from 'firebase';
import appConfig from '../app.json';
import * as Facebook from 'expo-facebook';
import { authResult } from '../models/auth';
import { AsyncStorage } from 'react-native';
import { FACEBOOK_TOKEN_KEY } from '../constants/AsyncStorage';
import Constants, { AppOwnership } from 'expo-constants';
import { Platform } from 'react-native';
import * as Google from 'expo-google-app-auth';
import * as GoogleSignIn from 'expo-google-sign-in';
import { Toast } from 'native-base';

export const loginWithApple = async (identityToken: string, nonce: string) => {
    if (identityToken) {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const provider = new firebase.auth.OAuthProvider("apple.com");
        const credential = provider.credential({
            idToken: identityToken,
            rawNonce: nonce
        });

        let firebaseUser: firebase.User;
        try{
            const cred = await firebase.auth().signInWithCredential(credential);
            firebaseUser = cred.user;
        } catch (error){
            var errorCode = error.code;
            if (errorCode === 'auth/account-exists-with-different-credential') {
                if(firebaseUser && error.credential){
                    await firebaseUser.linkWithCredential(error.credential);
                }
            }
        }

        if(firebaseUser){
            return firebaseUser;
        } else {
            return Promise.reject("Failed to sign in with Apple");
        }
    }

    return null;
  }

export const signInWithFacebook = 
    async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    await Facebook.initializeAsync(appConfig.expo.facebookAppId, appConfig.expo.facebookDisplayName);
    const result = await Facebook.logInWithReadPermissionsAsync(
        {
            permissions: ['public_profile', 'email'] // TODO: add user_friends
        });

    switch (result.type) {
        case 'success': {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
            const credential = firebase.auth.FacebookAuthProvider.credential(result.token);

            await AsyncStorage.setItem(FACEBOOK_TOKEN_KEY, result.token); //Store token for API usage

            let firebaseUser;
            try{
                const cred = await firebase.auth().signInWithCredential(credential);  // Sign in with Facebook credential
                firebaseUser = cred.user;
            } catch(error){
                var errorCode = error.code;
                if (errorCode === 'auth/account-exists-with-different-credential') {
                    Toast.show({
                        text: `Email already associated with a Google account. Attempting to merge profiles...`,
                        duration: 5000,
                        position: 'bottom'
                    });
                    return signInWithGoogle(error.credential);
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
                return Promise.reject("Failed to sign in with Facebook");
            }
        }
        case 'cancel': {
            return { type: 'cancel', message: 'User cancelled Facebook login' };
        }
    }
}

export const signInWithGoogle = 
    async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    if(Constants.appOwnership === AppOwnership.Expo){
        return _signInWithGoogleExpo(failedCredential);
    } else {
        return _signInWithGoogleAuth(failedCredential);
    }
}

const _signInWithGoogleAuth = async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    let result: GoogleSignIn.GoogleSignInAuthResult;
    // let clientId = Platform.OS === 'android' ? appConfig.expo.extra.androidClientId : appConfig.expo.extra.iosClientId;
    try{
        // await GoogleSignIn.initAsync({
        //     // clientId: clientId, 
        //     scopes: ['profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly']
        // });

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
    let clientId = Platform.OS === 'android' ? appConfig.expo.extra.androidClientId : appConfig.expo.extra.iosClientId;
    
    try{
        result = await Google.logInAsync({
            clientId: clientId,
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
            Toast.show({
                text: `Email already associated with a Facebook account. Attempting to merge profiles...`,
                duration: 5000,
                position: 'bottom'
            });
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