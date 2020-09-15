import firebase from 'firebase';
import appConfig from '../../app.json';
import * as Facebook from 'expo-facebook';
import { signInWithGoogle } from './googleAuth';
import { authResult } from '../../models/auth';


export const signInWithFacebook = 
    async (failedCredential?: firebase.auth.AuthCredential): Promise<authResult | firebase.User> => {
    await Facebook.initializeAsync(appConfig.expo.facebookAppId, appConfig.expo.facebookDisplayName);
    const result = await Facebook.logInWithReadPermissionsAsync(
        {
            permissions: ['public_profile', 'email', 'user_friends']
        });

    switch (result.type) {
        case 'success': {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
            const credential = firebase.auth.FacebookAuthProvider.credential(result.token); //TODO: store token for API usage?

            let firebaseUser;
            try{
                const cred = await firebase.auth().signInWithCredential(credential);  // Sign in with Facebook credential
                firebaseUser = cred.user;
            } catch(error){
                var errorCode = error.code;
                if (errorCode === 'auth/account-exists-with-different-credential') {
                    // TODO: Convert alert to toast or modal
                    alert(`Email already associated with another account. Let's link your Google account.`);
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