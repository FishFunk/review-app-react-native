import firebase from 'firebase';
import config from './firebaseServiceConfig';
import { reviewSummary, postReview } from '../models/reviews';
import { appUser } from '../models/user';
import * as Facebook from 'expo-facebook';
import appConfig from '../app.json';
import _ from 'lodash';
import { Email, Contact } from 'expo-contacts';
import { fullApiPlace, dbPlace } from '../models/place';
import _get from 'lodash/get';
import _filter from 'lodash/filter';
import _indexOf from 'lodash/indexOf';
import _intersection from 'lodash/intersection';

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

	async registerUser(first: string, last:string, email: string, password: string): Promise<{type: string, message: string}>{
		const { user } = await this.auth.createUserWithEmailAndPassword(email, password);
		if( user ) {
			user.displayName = `${first} ${last}`;
			return this.initializeUser(user);
		}
		else {
			return Promise.reject("Failed to create new Firebase user by email");
		}
	}

	async signInWithFacebook(): Promise<{type: string, message: string}>{
		await Facebook.initializeAsync(appConfig.expo.facebookAppId, appConfig.expo.facebookDisplayName);
		const result = await Facebook.logInWithReadPermissionsAsync(
			{
				permissions: ['public_profile', 'email', 'user_friends']
			});

		switch (result.type) {
			case 'success': {
				await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
				const credential = firebase.auth.FacebookAuthProvider.credential(result.token);
				console.log(result.token); //TODO: cache token??
				const { user } = await this.auth.signInWithCredential(credential);  // Sign in with Facebook credential
		
				if(user){
					return this.initializeUser(user);
				} else {
					return Promise.reject("Failed to sign in with Facebook");
				}
			}
			case 'cancel': {
				return Promise.resolve({type: 'cancel', message: 'User cancelled Facebook login'});
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

			await this.db.ref(`users/${newUser.id}`).set(newUser).catch(error => {
				return Promise.reject(error);
			});

			return Promise.resolve({ type: 'success', message: `Welcome ${newUser.firstName}!`})
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

	async getPlaceReviews(placeId: string): Promise<Array<postReview>> {
		if (!firebase.apps.length) {
			return Promise.reject("Firebase not initialized");;
		}

		const reviewSnapshots = await this.db.ref(`reviews/${placeId}`).once('value');
		if(!reviewSnapshots.exists()){
			return [];
		}

		return reviewSnapshots.val();
	}

	async getReviewSummaries(placeId: string): Promise<Array<reviewSummary>>{
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

		const reviews: reviewSummary[] = reviewSnapshots.val();
		let result = [];

		for(let i = 0; i < reviews.length; i++){
			const usrSnap = await this.db.ref(`users/${reviews[i].reviewer_id}`).once('value');
			let usr: appUser = usrSnap.val();
			if(usr){
				reviews[i].name = `${usr.firstName} ${usr.lastName}`;
				reviews[i].img = usr.photoUrl || '';
				result.push(reviews[i]);
			}
		}
		
		return result;
	};

	async findFriends(contactList: Contact[]): Promise<appUser[]>{
		if(!firebase.apps.length || !this.auth.currentUser){
			return Promise.reject("Firebase not initialized correctly");
		}

		const emails = <any>{};
		const lastNames = <any>{};

		contactList.map((contact, idx)=>{
			if(contact.contactType === "person"){
				if(contact.lastName) lastNames[contact.lastName] = 1;
				if(contact.emails){
					contact.emails.forEach((email: Email)=>{
						if (email.email) emails[email.email] = 1;
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

	async submitReview(place: fullApiPlace, review: any): Promise<any>{
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
		let placeRating = 0;
		userReviewIds.push(newReview.place_id);
		await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).set(userReviewIds);

		// Update place review list
		if(!existingReviewSnapshots.exists()){
			placeRating = newReview.avg_rating;
			await this.db.ref(`reviews/${newReview.place_id}`).set([newReview]);
		} else {
			const reviews = existingReviewSnapshots.val();
			reviews.push(newReview);
			reviews.forEach((r: postReview)=> placeRating += r.avg_rating);
			placeRating = placeRating / reviews.length;
			await this.db.ref(`reviews/${newReview.place_id}`).set(reviews);
		}

		// Add or update place
		const dbPlace: dbPlace = {
			id: _get(place, 'place_id', ''),
			name: _get(place, 'name', ''),
			lat: _get(place, 'geometry.location.lat', ''),
			lng: _get(place, 'geometry.location.lng', ''),
			rating: placeRating
		}

		return this.db.ref(`places/${dbPlace.id}`).set(dbPlace);
	}

	async getNearbyPlaces(lat: number, lng: number, radiusInKm=10): Promise<any[]>{
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}
	
		let places: any[] = [];
		const placesSnapshot = await this.db.ref(`places`).once('value');
		placesSnapshot.forEach((snap)=>{
			const place = snap.val();
			if(this._isInRadius(lat, lng, place.lat, place.lng, radiusInKm)){
				places.push(place);
			}
		});

		// Filter places if they contain reviews by current user or followers
		let filteredPlaces = [];
		const targetFollowerIds = await this.getUserFollowingIds();
		for(let place of places){
			const targetReviews = await this.getPlaceReviews(place.id);
			const matches = _filter(
				targetReviews, (r)=> r.reviewer_id === this.auth.currentUser?.uid || 
					_indexOf(targetFollowerIds, r.reviewer_id) >= 0);

			if(matches.length > 0){
				filteredPlaces.push(place);
			}
		}

		return filteredPlaces;
	}

	_isInRadius(
		centerLat: number, 
		centerLng: number, 
		targetLat: number, 
		targetLng: number, 
		desiredRadiusKm: number): boolean{
		var R = 6371; // km
		var dLat = this._toRad(targetLat-centerLat);
		var dLon = this._toRad(targetLng-centerLng);
		var lat1 = this._toRad(centerLat);
		var lat2 = this._toRad(targetLat);

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var distance = R * c;

		return distance <= desiredRadiusKm;
	}

	_toRad(val: number): number {
		return val * Math.PI / 180;
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