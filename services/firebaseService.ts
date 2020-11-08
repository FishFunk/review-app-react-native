import * as firebase from 'firebase/app';
import config from './firebaseServiceConfig';
import { reviewSummary, dbReview } from '../models/reviews';
import { appUser } from '../models/user';
import { Email, Contact } from 'expo-contacts';
import { fullApiPlace, dbPlace } from '../models/place';
import _get from 'lodash/get';
import _filter from 'lodash/filter';
import _indexOf from 'lodash/indexOf';
import _intersection from 'lodash/intersection';
import _uniq from 'lodash/uniq';
import _first from 'lodash/first';
import _last from 'lodash/last';
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

		if(!firebase.apps.length){
			firebase.initializeApp(config);
			console.log(`Firebase initialized successfully`);
		}

		this.db = firebase.database();
		this.auth = firebase.auth();
	}

	getCurrentUserId(){
		return this.auth.currentUser?.uid;
	}

	async registerPushNotificationToken(){
		const result = await registerForPushNotificationsAsync();
		if(result?.status === 'success'){
			const snapshot = await this.db.ref(`users/${this.auth.currentUser?.uid}/push_tokens`).once('value');
			if(snapshot.exists()){
				const tokens = snapshot.val();
				tokens.push(result.token?.data);
				const uniqTokens = _uniq(tokens);
				return this.db.ref(`users/${this.auth.currentUser?.uid}/push_tokens`).set(uniqTokens);
			} else {
				return this.db.ref(`users/${this.auth.currentUser?.uid}/push_tokens`).set([result.token?.data]);
			}
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
				firstName: _first(names) || '',
				lastName: _last(names)|| '',
				email: loggedInUserData.email || '',
				dateJoined: today,
				lastActive: today,
				following: [],
				reviews: [],
				mobile: loggedInUserData.phoneNumber || '',
				photoUrl: loggedInUserData.photoURL || '',
				push_tokens: []
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
		return this.auth.currentUser.sendEmailVerification();
	}

	async sendPhoneVerificationCode(phoneNumber: string, recaptchaRef: any){
		// The FirebaseRecaptchaVerifierModal ref implements the
		// FirebaseAuthApplicationVerifier interface and can be
		// passed directly to `verifyPhoneNumber`.
		try {
			const phoneProvider = new firebase.auth.PhoneAuthProvider();
			const verificationId = await phoneProvider.verifyPhoneNumber(
				phoneNumber,
				recaptchaRef);

			return verificationId;
		} catch (err) {
			return Promise.reject(err.message);
		}
	}

	async confirmPhoneVerification(
		verificationId: string, 
		verificationCode: string){
		try {
			const credential = firebase.auth.PhoneAuthProvider.credential(
				verificationId,
				verificationCode);
			await this.auth.currentUser?.linkWithCredential(credential);

			await this.updateUserData({ phone_verified: true });

			return "Phone authentication successful 👍";
		} catch (err) {
			return Promise.reject(err.message);
		}
	}

	async getMetadata(keyName: string): Promise<string>{
		this._verifyInitialized();
		const snap = await this.db.ref(`metadata/${keyName}`).once('value');
		return snap.val();
	}

	async getPlace(placeId: string, filterReviewList: boolean = true): Promise<dbPlace | null>{
		this._verifyInitialized();
		const placeSnap = await this.db.ref(`places/${placeId}`).once('value');
		if(placeSnap.exists()){
			const place = placeSnap.val();
			if(filterReviewList){
				const targetIds = await this.getUserFollowingIds();
				place.reviews = await this._getFilteredPlaceReviews(place, targetIds);
				return place;
			} else {
				return place;
			}
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
			// Exclude current user from results
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
			let result = [];
			let ids = userReviewsSnapshot.val();
			for(let i of ids){
				if(i != null)
					result.push(i);
			}
			
			return result;
		}
	}

	async _getFilteredPlaceReviews(place: dbPlace, targetIds: string[]): Promise<Array<dbReview>> {
		this._verifyInitialized();

		// Filter reviews if they were written by target user IDs
		let filteredReviews = [];
		for(let review of place.reviews){
			if(review.reviewer_id === this.getCurrentUserId() || 
				_indexOf(targetIds, review.reviewer_id) >= 0){
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

		const dbReviewSnapshot = await this.db.ref(`places/${placeId}/reviews`).once('value');
		if(!dbReviewSnapshot.exists()){
			return Promise.resolve([]);
		}

		const userFollowingIds = await this.getUserFollowingIds();
		let reviewSummaries: reviewSummary[] = [];
		let promises: Promise<any>[] = [];

		dbReviewSnapshot.forEach((snapshot: firebase.database.DataSnapshot)=>{
			promises.push(this.asyncForEachReviewSummary.apply(this, 
				[snapshot, placeId, reviewSummaries, userFollowingIds]));
		});
		
		await Promise.all(promises);

		return reviewSummaries;
	};

	async asyncForEachReviewSummary(
		snapshot: firebase.database.DataSnapshot, 
		placeId: string, 
		reviewSummaries: reviewSummary[],
		followingIds: string[]){

		const key = snapshot.key;
		const review = snapshot.val();

		// Filter reviews if they were written by target user IDs
		if(_indexOf(followingIds, review.reviewer_id) >= 0 || 
			review.reviewer_id === this.auth.currentUser?.uid){

			const usrSnap = await this.db.ref(`users/${review.reviewer_id}`).once('value');
			let usr: appUser = usrSnap.val();
	
			if(usr){
				let reviewSummary: reviewSummary = {
					img: usr.photoUrl || '',
					name: `${usr.firstName} ${usr.lastName}`,
					comments: review.comments,
					avg_rating: review.avg_rating,
					pricing: review.pricing,
					date: review.date,
					reviewer_id: review.reviewer_id,
					place_id: placeId,
					review_key: key,
					reports: review.reports,
					thanks: review.thanks
				}
				
				reviewSummaries.push(reviewSummary);
			}
		}
	}

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
				if((user.email && emails[user.email.toLowerCase()]) || 
					(user.lastName && lastNames[user.lastName.toLowerCase()])){
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
			pricing: review.pricing,
			comments: review.comments,
			date: new Date().toDateString(),
			reports: [],
			thanks: []
		}

		const dbPlaceSnapshot = await this.db.ref(`places/${place.place_id}`).once('value');
		if(!dbPlaceSnapshot.exists()){
			// Create new place in DB
			const dbPlace: dbPlace = {
				id: _get(place, 'place_id', ''),
				name: _get(place, 'name', ''),
				lat: _get(place, 'geometry.location.lat', ''),
				lng: _get(place, 'geometry.location.lng', ''),
				icon: _get(place, 'icon', ''),
				formatted_address: _get(place, 'formatted_address', ''),
				types: place.types,
				reviews: [newReview]
			}
			await this.db.ref(`places/${place.place_id}`).set(dbPlace);
		} else {
			// Update existing place review list
			await this.db.ref(`places/${newReview.place_id}/reviews`).push(newReview);
		}

		// Update user review list
		let userReviewIds = await this.getUserReviewIdList();
		userReviewIds.push(newReview.place_id);
		userReviewIds = _uniq(userReviewIds);
		return await this.db.ref(`users/${this.auth.currentUser.uid}/reviews`).set(userReviewIds);
	}

	async getNearbyPlaces(lat: number, lng: number, radiusInKm=25): Promise<dbPlace[]>{
		this._verifyInitialized();
	
		let places: dbPlace[] = [];
		const placesSnapshot = await this.db.ref(`places`).once('value');
		placesSnapshot.forEach((snap)=>{
			const place = snap.val();
			if(isInRadius(lat, lng, place.lat, place.lng, radiusInKm)){
				places.push(place);
			}
		});

		const result = await this._filterPlacesByReviewFollowers(places);
		return result;
	}

	async getPlacesById(placeIds: string[], filterByFollowers = true): Promise<dbPlace[]>{
		this._verifyInitialized();
	
		let places: dbPlace[] = [];
		const placesSnapshot = await this.db.ref(`places`).once('value');
		placesSnapshot.forEach((snap)=>{
			const place = snap.val();
			if(_indexOf(placeIds, place.id) >= 0){
				places.push(place);
			}
		});

		if(filterByFollowers){
			return this._filterPlacesByReviewFollowers(places);
		} else {
			return places;
		}
	}

	async _filterPlacesByReviewFollowers(places: dbPlace[]){
		// Filter places if they contain reviews by current user or followers
		let filteredPlaces = [];
		for(let place of places){
			const targetIds = await this.getUserFollowingIds();
			const targetReviews = await this._getFilteredPlaceReviews(place, targetIds);

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

	async submitReviewReport(reportData: any): Promise<any>{
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}

		await this.db.ref(`places/${reportData.place_id}/reviews/${reportData.review_key}/reports`).push(reportData);
	}

	async submitReviewThankYou(reviewSummary: reviewSummary){
		if(!firebase.apps.length || !this.auth.currentUser){
			throw new Error("Firebase not initialized correctly!");
		}

		await this.db.ref(`places/${reviewSummary.place_id}/reviews/${reviewSummary.review_key}/thanks`).push({user_id: this.auth.currentUser.uid});
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