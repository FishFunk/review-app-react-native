import firebase from 'firebase';
import config from './firebaseServiceConfig';
import { reviewSummary, dbReview } from '../models/reviews';
import { appUser } from '../models/user';
import _ from 'lodash';
import { Email, Contact } from 'expo-contacts';
import { fullApiPlace, dbPlace } from '../models/place';
import _get from 'lodash/get';
import _filter from 'lodash/filter';
import _indexOf from 'lodash/indexOf';
import _intersection from 'lodash/intersection';
import _uniq from 'lodash/uniq'
import { registerForPushNotificationsAsync } from './notificationService';
import { generateRandomString, isInRadius } from './utils';
import { signInWithGoogle } from './auth/googleAuth';
import { signInWithFacebook } from './auth/facebookAuth';
import { authResult } from '../models/auth';

class FirebaseService {
    public auth: firebase.auth.Auth;
    private db: firebase.database.Database;

	constructor(){
		if (Object.entries(config).length === 0) {
			throw new Error('Missing Firebase Configuration!');
		}

		firebase.initializeApp(config);
		this.db = firebase.database();
		this.auth = firebase.auth();
		console.log(`Firebase initialized successfully`);
	}

	getCurrentUserId(){
		return this.auth.currentUser?.uid;
	}

	async registerPushNotificationToken(){
		const result = await registerForPushNotificationsAsync();
		if(result?.status === 'success'){
			return this.db.ref(`users/${this.auth.currentUser?.uid}/push_token`).set(result.token);
		}
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

	async loginWithGoogle(): Promise<authResult>{
		const result: any = await signInWithGoogle();
		if(result.uid){
			// Succssfully logged in User
			return this.initializeUser(result);
		} else {
			return result;
		}
	}

	async loginWithFacebook(): Promise<authResult>{
		const result: any = await signInWithFacebook();
		if(result.uid){
			// Succssfully logged in User
			return this.initializeUser(result);
		} else {
			return result;
		}
	}

	async initializeUser(loggedInUserData: firebase.User): Promise<authResult>{
		this._verifyInitialized();

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
				following: [],
				placesReviewed: [],
				mobile: loggedInUserData.phoneNumber || '',
				photoUrl: loggedInUserData.photoURL || ''
			}

			await this.db.ref(`users/${newUser.id}`).set(newUser).catch(error => {
				return Promise.reject(error);
			});

			await loggedInUserData.sendEmailVerification();

			return Promise.resolve({ type: 'success', message: `Welcome ${newUser.firstName}!`})
		} else {
			// User already exists, update user data
			var usr = userSnap.val();
			await this.updateUserData({
				lastActive: new Date().toDateString(),
				photoUrl: loggedInUserData.photoURL, 
				mobile: loggedInUserData.phoneNumber,
				email_verified: loggedInUserData.emailVerified
			});

			return Promise.resolve({ type: 'success', message: `Welcome back ${usr.firstName}!`});
		}
	}

	sendUserEmailVerification(){
		this._verifyInitialized();
		return this.auth.currentUser?.sendEmailVerification();
	}

	async getMetadata(keyName: string): Promise<string>{
		this._verifyInitialized();
		const snap = await this.db.ref(`metadata/${keyName}`).once('value');
		return snap.val();
	}

	async getPlace(placeId: string): Promise<dbPlace | null>{
		this._verifyInitialized();
		const placeSnap = await this.db.ref(`places/${placeId}`).once('value');
		if(placeSnap.exists()){
			return placeSnap.val();
		} else {
			return null;
		}
	}

	async getUser(userId?: string): Promise<appUser>{
		this._verifyInitialized();

		if(!userId){
			userId = this.auth.currentUser.uid;
		}

		const userSnap = await this.db.ref(`users/${userId}`).once('value');
		if(userSnap.exists()){
			return userSnap.val();
		} else {
			throw new Error(`No user found matching id: ${userId}`);
		}
	}

	async getMultipleUsers(userIds: string[]): Promise<appUser[]>{
		this._verifyInitialized();

		let result = new Array<appUser>();
		const usersSnapshot = await this.db.ref(`users`).once('value');
		usersSnapshot.forEach((snap)=>{
			const user = snap.val();
			if(user.id !== this.auth.currentUser?.uid && _indexOf(userIds, user.id) >= 0){
				result.push(user);
			}
		});

		return result;
	}

	async searchUsers(searchValue: string): Promise<appUser[]>{

		// TODO: Query results based on search value. Caller is doing filtering currently
		this._verifyInitialized();

		let matches = new Array<appUser>();
		const usersSnapshot = await this.db.ref(`users`).once('value');
		usersSnapshot.forEach((snap)=>{
			const user = snap.val();
			if(user.id !== this.auth.currentUser?.uid){
				matches.push(user);
			}
		});

		return matches;
	}
	
	async getUserReviewIdList() {
		this._verifyInitialized();

		const userReviewsSnapshot = await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).once('value');
		if(!userReviewsSnapshot.exists()){
			return [];
		} else {
			return userReviewsSnapshot.val();
		}
	}

	async getFilteredPlaceReviews(placeId: string): Promise<Array<dbReview>> {
		this._verifyInitialized();

		const reviewSnapshots = await this.db.ref(`reviews/${placeId}`).once('value');
		if(!reviewSnapshots.exists()){
			return [];
		}

		const reviews: dbReview[] = reviewSnapshots.val();

		// Filter reviews if they were written by current user or followers
		let filteredReviews = [];
		const targetFollowerIds = await this.getUserFollowingIds();
		
		for(let review of reviews){
			if(review.reviewer_id === this.getCurrentUserId() ||
				_indexOf(targetFollowerIds, review.reviewer_id) >= 0){
					filteredReviews.push(review);
			}
		}
		
		return filteredReviews;
	}

	async getReviewSummaries(placeId: string): Promise<Array<reviewSummary>>{
		this._verifyInitialized();

		if(!placeId){
			return Promise.resolve([]);
		}

		const dbReviews = await this.getFilteredPlaceReviews(placeId);
		const reviewSummaries: reviewSummary[] = [];
		
		for(let review of dbReviews){
			const usrSnap = await this.db.ref(`users/${review.reviewer_id}`).once('value');
			let usr: appUser = usrSnap.val();
			if(usr){
				let reviewSummary: reviewSummary = {
					img: usr.photoUrl || '',
					name: `${usr.firstName} ${usr.lastName}`,
					comments: review.comments,
					avg_rating: review.avg_rating,
					date: review.date,
					reviewer_id: review.reviewer_id
				}
				
				reviewSummaries.push(reviewSummary);
			}
		}
		
		return reviewSummaries;
	};

	async findFriends(contactList: Contact[]): Promise<appUser[]>{
		this._verifyInitialized();

		const emails = <any>{};
		const lastNames = <any>{};

		contactList.map((contact, idx)=>{
			if(contact.contactType === "person"){
				if(contact.lastName) lastNames[contact.lastName.toLowerCase()] = 1;
				if(contact.emails){
					contact.emails.forEach((email: Email)=>{
						if (email.email) emails[email.email.toLowerCase()] = 1;
					});
				}
			}
		});

		let matches = new Array<appUser>();
		const usersSnapshot = await this.db.ref(`users`).once('value');
		usersSnapshot.forEach((snap)=>{
			const user = snap.val();
			if(this.auth.currentUser.uid !== user.id){ // Exclude self from results
				if(emails[user.email.toLowerCase()] || 
					lastNames[user.lastName.toLowerCase()]){
					matches.push(user);
				}
			}
		});

		return matches;
	}

	async submitReview(place: fullApiPlace, review: any): Promise<any>{
		this._verifyInitialized();

		const newReview: dbReview = {
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

		let userReviewIds = await this.getUserReviewIdList();
		const existingReviewSnapshots = await this.db.ref(`reviews/${newReview.place_id}`).once('value');

		// Update user review list
		let placeRating = 0;
		userReviewIds.push(newReview.place_id);
		userReviewIds = _uniq(userReviewIds);
		await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).set(userReviewIds);

		// Update place review list
		if(!existingReviewSnapshots.exists()){
			placeRating = newReview.avg_rating;
			await this.db.ref(`reviews/${newReview.place_id}`).set([newReview]);
		} else {
			const reviews = existingReviewSnapshots.val();
			reviews.push(newReview);
			reviews.forEach((r: dbReview)=> placeRating += r.avg_rating);
			placeRating = placeRating / reviews.length;
			await this.db.ref(`reviews/${newReview.place_id}`).set(reviews);
		}

		// Add or update place
		const dbPlace: dbPlace = {
			id: _get(place, 'place_id', ''),
			name: _get(place, 'name', ''),
			lat: _get(place, 'geometry.location.lat', ''),
			lng: _get(place, 'geometry.location.lng', ''),
			rating: +placeRating.toFixed(1)
		}

		return this.db.ref(`places/${dbPlace.id}`).set(dbPlace);
	}

	async getNearbyPlaces(lat: number, lng: number, radiusInKm=25): Promise<any[]>{
		this._verifyInitialized();
	
		let places: any[] = [];
		const placesSnapshot = await this.db.ref(`places`).once('value');
		placesSnapshot.forEach((snap)=>{
			const place = snap.val();
			if(isInRadius(lat, lng, place.lat, place.lng, radiusInKm)){
				places.push(place);
			}
		});

		// Filter places if they contain reviews by current user or followers
		let filteredPlaces = [];
		for(let place of places){
			const targetReviews = await this.getFilteredPlaceReviews(place.id);

			if(targetReviews.length > 0){
				filteredPlaces.push(place);
			}
		}

		return filteredPlaces;
	}

	_verifyInitialized(){
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
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

	logError(log: string | Object | Error){
		if(!firebase.apps.length){
			throw new Error("Firebase not initialized correctly!");
		}

		console.error(log);

		const key = generateRandomString();
		const data = {
			data: log,
			timeStamp: new Date().toISOString()
		}
		
		return this.db.ref(`logs/${key}`).set(data);
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