import React, { useState, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import firebaseConfig from '../services/firebaseServiceConfig';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Button, Input, Label, Text, Toast, View } from 'native-base';
import { Platform } from 'react-native';
import theme from '../styles/theme';
import FirebaseService from '../services/firebaseService';
import PhoneInput from "react-native-phone-number-input";
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function PhoneVerifyRecaptcha() {

    const recaptchaVerifier = useRef<any>(null);

    const [phoneValue, setPhoneValue] = useState("");
    const [formattedPhoneValue, setFormattedPhoneValue] = useState("");
    const [phoneValid, setPhoneValid] = useState(false);
    const phoneInput = useRef<PhoneInput>(null);

    const [verificationId, setVerificationId] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');

    const [toggleView, setToggleView] = useState<boolean>(false);
    const flyInLeftAnim = useRef(new Animated.Value(5000)).current;
    const flyOffLeftAnim = useRef(new Animated.Value(0)).current;

    const showMessage = (msg: string)=>{
        Toast.show({ text: msg, position: 'bottom', duration: 2000 });
    }

    const runAnimations = ()=>{

        Animated.timing(
            flyOffLeftAnim,
          {
            useNativeDriver: true,
            toValue: -5000,
            duration: 1000
          }
        ).start();

        setTimeout(()=>{
            setToggleView(true);
            Animated.timing(
                flyInLeftAnim,
              {
                useNativeDriver: true,
                toValue: 0,
                duration: 1000
              }
            ).start();
        }, 1000)
    }

    return (
        <View style={styles.container}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig}
            />
            <Animated.View style={{
                alignItems: 'center',
                display: toggleView ? 'none' : 'flex',
                transform: [{translateX: flyOffLeftAnim}]
            }}>
                {/* <Label>Enter phone number</Label> */}
                <PhoneInput
                    ref={phoneInput}
                    defaultValue={phoneValue}
                    defaultCode="US"
                    onChangeText={(text) => {
                        setPhoneValue(text);
                    }}
                    onChangeFormattedText={(text) => {
                        setFormattedPhoneValue(text);
                    }}
                    withDarkTheme={false}
                    withShadow={false}
                    autoFocus={false}
                />
                <Button
                    small
                    style={styles.btn}
                    disabled={!phoneValue}
                    onPress={() => {   
                        const checkValid = phoneInput.current?.isValidNumber(phoneValue);
                        if(!checkValid){
                            showMessage('Invalid phone number');
                            return;
                        }
                        FirebaseService.sendPhoneVerificationCode(formattedPhoneValue, recaptchaVerifier.current)
                            .then(verificationId => {
                                setVerificationId(verificationId);
                                showMessage("Verification code has been sent to your phone.");
                                runAnimations();
                            })
                            .catch(errorMessage =>{
                                showMessage(errorMessage);
                            });
                    }}>
                    <Text>Send Code</Text>
                </Button>
            </Animated.View>
            <Animated.View style={{
                display: toggleView ? 'flex' : 'none',
                flexDirection: 'column',
                transform: [{translateX: flyInLeftAnim}]}}>
                <Label>Enter Verification code</Label>
                <Input
                    style={styles.input}
                    editable={!!verificationId}
                    placeholder="123456"
                    onChangeText={text => setVerificationCode(text)}
                />
                <Button
                    small
                    style={styles.btn}
                    disabled={!verificationId}
                    onPress={async () => {
                        FirebaseService.confirmPhoneVerification(verificationId, verificationCode)
                            .then(successMsg =>{
                                showMessage(`${successMsg}`);
                            })
                            .catch(failMsg => {
                                showMessage(`Error: ${failMsg}`);
                            });
                    }}
                >
                    <Text>Confirm</Text>
                </Button>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center'
    },
    input: {
        marginTop: 5,
        alignSelf: 'center',
        backgroundColor: theme.LIGHT_COLOR,
        borderRadius: 50,
        borderWidth: 1, 
        borderStyle: 'solid', 
        borderColor: theme.DARK_COLOR,
        width: '100%',
        textAlign: 'center'
    },
    btn: {
        marginTop: 10,
        alignSelf: 'center'
    }
});