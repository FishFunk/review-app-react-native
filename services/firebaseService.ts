import firebase from 'firebase';
import config from './firebaseServiceConfig';

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

	getUserData = (userId: string) => {
		// if (!firebase.apps.length) {
		// 	return Promise.reject("Firebase not initialized");;
		// }
		// return new Promise((resolve, reject) => {
		// 	this.db
		// 		.ref(`users/${userId}`)
		// 		.once('value')
		// 		.then(snapshot => {
		// 			const user = snapshot.val();
		// 			resolve(user);
		// 		});
		// });
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