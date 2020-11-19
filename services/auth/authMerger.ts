import { signInWithGoogle } from './googleAuth';
import { signInWithFacebook } from './facebookAuth';

// Middle-man class to avoid cyclical referencing
class AuthMerger{
    SignInWithGoogle(linkCredential?: any){
        return signInWithGoogle(linkCredential);
    }

    SignInWithFacebook(linkCredential?: any){
        return signInWithFacebook(linkCredential);
    }
}

const instance = new AuthMerger;
export default instance;