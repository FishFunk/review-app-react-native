import firebase from 'firebase';
import config from './firebaseServiceConfig';
import { reviewSummary, postReview } from '../models/reviews';
import { appUser } from '../models/user';
import * as Facebook from 'expo-facebook';
import appConfig from '../app.json';
import _ from 'lodash';

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

    async login(email: string, password: string): Promise<{type: string, message: string}> {
		const { user } = await this.auth.signInWithEmailAndPassword(email, password);
		if(user) {
			return this.initializeUser(user);
		} else {
			return Promise.reject("Failed to login to Firebase by email");
		}
	}

	async registerUser(email: string, password: string): Promise<{type: string, message: string}>{
		const { user } = await this.auth.createUserWithEmailAndPassword(email, password);
		if( user ) {
			return this.initializeUser(user);
		}
		else {
			return Promise.reject("Failed to create new Firebase user by email");
		}
	}

	async signInWithFacebook(): Promise<{type: string, message: string}>{
		await Facebook.initializeAsync();
		const result = await Facebook.logInWithReadPermissionsAsync(
			{
				permissions: ['public_profile', 'email']
			});

		switch (result.type) {
			case 'success': {
				await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
				const credential = firebase.auth.FacebookAuthProvider.credential(result.token);
				const { user } = await this.auth.signInWithCredential(credential);  // Sign in with Facebook credential
		
				if(user){
					return this.initializeUser(user);
				} else {
					return Promise.reject("Failed to sign in with Facebook");
				}
			}
			case 'cancel': {
				return Promise.reject('Facebook sign in cancelled');
			}
		}
	}

	async initializeUser(loggedInUserData: firebase.User): Promise<{type: string, message: string}>{
		const userSnap = await this.db.ref(`users/${loggedInUserData.uid}`).once('value');
		if(!userSnap.exists()){
			// Initialize new user
			const names = loggedInUserData.displayName?.split(' ');
			const today = new Date().toDateString();
			const newUser: appUser = {
				id: loggedInUserData.uid,
				firstName: _.first(names) || '',
				lastName: _.last(names)|| '',
				email: loggedInUserData.email|| '',
				dateJoined: today,
				lastActive: today,
				friends: [],
				placesReviewed: [],
				mobile: loggedInUserData.phoneNumber || '',
				photoUrl: loggedInUserData.photoURL || ''
			}

			return this.db.ref(`uesrs/${newUser.id}`).set(newUser);
		} else {
			// User already exists, do nothing
			var usr = userSnap.val();
			return Promise.resolve({ type: 'success', message: `Welcome back ${usr.firstName}!`});
		}
	}
	
	async getUserReviewIdList() {
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}

		const userReviewsSnapshot = await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).once('value');
		if(!userReviewsSnapshot.exists()){
			return [];
		} else {
			return userReviewsSnapshot.val();
		}
	}

	async getReviews(placeId: string): Promise<Array<reviewSummary>>{
		if(!placeId){
			return Promise.resolve([]);
		}

		if (!firebase.apps.length) {
			return Promise.reject("Firebase not initialized");;
		}


		const reviewSnapshots = await this.db.ref(`reviews/${placeId}`).once('value');
		if(!reviewSnapshots.exists()){
			return [];
		}

		const reviews = reviewSnapshots.val();
		let result = [];

		for(let i = 0; i < reviews.length; i++){
			const usrSnap = await this.db.ref(`users/${reviews[i].reviewer_id}`).once('value');
			let usr = usrSnap.val();
			if(usr){
				reviews[i].name = `${usr.firstName} ${usr.lastName}`;
				reviews[i].img = usr.img;
				result.push(reviews[i]);
			}
		}
		
		return result;
	};

	async findFriends(contactList: any[]): Promise<appUser[]>{
		if(!firebase.apps.length || !this.auth.currentUser){
			return Promise.reject("Firebase not initialized correctly");
		}

		const emails = <any>{};
		const lastNames = <any>{};

		contactList.map((contact, idx)=>{
			if(contact.contactType === "person"){
				lastNames[contact.lastName] = 1;
				if(contact.emails){
					contact.emails.forEach((email: string)=>{
						emails[email] = 1;
					});
				}
			}
		});

		let matches = new Array<appUser>();
		const usersSnapshot = await this.db.ref(`users`).once('value');
		usersSnapshot.forEach((snap)=>{
			const user = snap.val();
			if(emails[user.email] || lastNames[user.lastName]){
				matches.push(user);
			}
		});

		return matches;
	}

	async submitReview(review: any): Promise<any>{
		// TODO: Add place to DB?
		if(!firebase.apps.length || !this.auth.currentUser){
			return Promise.reject("Firebase not initialized correctly");
		}

		const newReview: postReview = {
			place_id: review.place_id,
			place_name: review.place_name,
			reviewer_id: this.auth.currentUser.uid,
			atmosphere: review.atmosphere,
			menu: review.menu,
			service: review.service,
			avg_rating: review.avg_rating,
			comments: review.comments,
			date: new Date().toDateString()
		}

		const userReviewIds = await this.getUserReviewIdList();
		const existingReviewSnapshots = await this.db.ref(`reviews/${newReview.place_id}`).once('value');

		// Update user review list
		userReviewIds.push(newReview.place_id);
		await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).set(userReviewIds);

		// Update place review list
		if(!existingReviewSnapshots.exists()){
			return this.db.ref(`reviews/${newReview.place_id}`).set([newReview]);
		} else {
			const reviews = existingReviewSnapshots.val();
			reviews.push(newReview);
			return this.db.ref(`reviews/${newReview.place_id}`).set(reviews);
		}
	}

	async getUserFollowingIds(): Promise<string[]> {
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}

		const userFriendsSnapshot = await this.db.ref(`users/${this.auth.currentUser.uid}/following`).once('value');
		if(!userFriendsSnapshot.exists()){
			return [];
		} else {
			return userFriendsSnapshot.val();
		}
	}

	updateUserData = (data: any) => {
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}

		return this.db.ref(`users/${this.auth.currentUser.uid}`).update(data);
	};

	setNewUser = (newUser: appUser) => {
		throw new Error("not implemented");
	}

	deleteUser = (userId: string) => {
		throw new Error("not implemented");
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