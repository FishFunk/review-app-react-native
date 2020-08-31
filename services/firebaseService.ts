import firebase from 'firebase';
import config from './firebaseServiceConfig';
import { review } from '../models/reviews';

class FirebaseService {
    public auth: firebase.auth.Auth;
    private db: firebase.database.Database;

	constructor(){
		if (Object.entries(config).length === 0) {
			console.warn('Missing Firebase Configuration');
		}

		firebase.initializeApp(config);
		this.db = firebase.database();
		this.auth = firebase.auth();

		console.log(`Firebase initialized successfully`);
	}

    login(username: string, password: string): Promise<any> {
        return this.auth.signInWithEmailAndPassword(username, password);
    }

	currentUserId = () => {
		return this.auth.currentUser ? this.auth.currentUser.uid : null;
	}

	userRef = () => {
		return this.db.ref().child("users");
	}

	async getReviews(placeId: string): Promise<Array<review>>{
		if(!placeId){
			return Promise.resolve([]);
		}

		if (!firebase.apps.length) {
			return Promise.reject("Firebase not initialized");;
		}

		const reviewSnapshots = await this.db.ref(`reviews/${placeId}`).once('value');
		const reviews = reviewSnapshots.val();
		let result = [];

		for(let i = 0; i < reviews.length; i++){
			const usrSnap = await this.db.ref(`users/${reviews[i].reviewer_id}`).once('value');
			let usr = usrSnap.val();
			reviews[i].name = `${usr.firstName} ${usr.lastName}`;
			reviews[i].img = usr.img;
			result.push(reviews[i]);
		}
		
		return result;
	};

	updateUserData = (user: any) => {
		// if (!firebase.apps.length) {
		// 	return Promise.reject("Firebase not initialized");
		// }
		
		// return this.db.ref(`users/${user.id}`).update(user);
	};

	setNewUser = (newUser: any) => {
		// if (!firebase.apps.length) {
		// 	return Promise.reject("Firebase not initialized");
		// }

		// if(!newUser.id) {
		// 	return Promise.reject("User object must conatain a unique ID");
		// }

		// return this.db.ref(`users/${newUser.id}`).set(newUser);
	}

	deleteUser = (userId: string) => {
		// if (!firebase.apps.length) {
		// 	return Promise.reject("Firebase not initialized");
		// }

		// return this.db.ref(`users/${userId}`).remove();
	}

	onAuthStateChanged = (callback: firebase.Observer<any>) => {
		return this.auth.onAuthStateChanged(callback);
	};

	signOut = () => {
		if (!this.auth) {
			return;
		}
		this.auth.signOut();
	};
}

const instance = new FirebaseService();

export default instance;