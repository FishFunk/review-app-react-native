import { AsyncStorage } from 'react-native';
import { FACEBOOK_TOKEN_KEY } from '../constants/AsyncStorage';

// export const getFacebookNameAndEmail = async (uid: string, token: string)=>{
//     const url = `https://graph.facebook.com/${uid}?fields=name,email&access_token=${token}`;
// }

export const getUserFriends = async () => {
    const token = await AsyncStorage.getItem(FACEBOOK_TOKEN_KEY);
    if(token){
        const url = `https://graph.facebook.com/me/friends?access_token=${token}`;
        return _execute(url);
    } else {
        return Promise.reject("No Facebook access token available");
    }
}


async function _execute<T>(url: string){
    return new Promise<T>((resolve, reject)=>{
        fetch(url)
        .then(res => res.json())
        .then(res => {
            resolve(res);
        })
        .catch(error => reject(error));
    });
}