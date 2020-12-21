import React from "react";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import { View } from "native-base";
import FirebaseService from '../services/firebaseService';

export class AppleAuth extends React.Component<{},{}> {

    state = {
        loginAvailable: false
    }

    componentDidMount(){
        this.initialize();
    }

    async initialize(){
        const bool = await AppleAuthentication.isAvailableAsync();
        this.setState({ loginAvailable: bool });
    }

    loginWithApple = async () => {
        try{
            const csrf = Math.random().toString(36).substring(2, 15);
            const nonce = Math.random().toString(36).substring(2, 10);
            const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL
                ],
                state: csrf,
                nonce: hashedNonce
            });

            const { identityToken, email, fullName } = appleCredential;
        
            return FirebaseService.loginWithApple(identityToken, nonce, email, fullName);
        } catch (error){
            var errorCode = error.code;
            if(errorCode === 'ERR_CANCELED'){
                // User cancelled
            }
            else if (errorCode === 'auth/account-exists-with-different-credential') {
                // TODO: Link accounts?
            } else {
                console.error(error);
                return Promise.reject({
                    error: error, 
                    message: "Failed to sign in with Apple" });
            }
        }
    }

    render(){
        return (
            this.state.loginAvailable === true ? 
                <View style={{ alignItems: "center" }}>
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                        cornerRadius={5}
                        style={{ width: 250, height: 50 }}
                        onPress={this.loginWithApple.bind(this)}/>
                </View> : null
        )
    }
};