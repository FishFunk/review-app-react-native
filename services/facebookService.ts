import * as Facebook from 'expo-facebook';

export const getFacebookNameAndEmail = (uid: string, token: string)=>{
    const url = `https://graph.facebook.com/${uid}?fields=name,email&access_token=${token}`;
}

export const getUserFriends = (token: string)=>{
    const url = `https://graph.facebook.com/me/friends?access_token=${token}`;
}

export const getUserImage = (token: string) => {
    const url = `https://graph.facebook.com/me/friends?access_token=${token}`
}