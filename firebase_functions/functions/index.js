'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = require('lodash');
const fetch = require('node-fetch');

admin.initializeApp();

const _sendExpoTokenRequest = async (payload) =>{
  return fetch('https://exp.host/--/api/v2/push/send', {
    method: "POST",
    headers: {
      host: 'exp.host',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}

/**
 * Triggers when a user  writes a review
 * */
exports.sendReviewNotification = functions.database.ref('/reviews/{place_id}')
    .onWrite(async (change, context) => {
      // ignore delete
      if(context.eventId === 'google.firebase.database.ref.delete' || 
        context.eventId === 'google.firestore.document.delete')
      {
        return;
      }
      
      const place_id = context.params.place_id;
      
      const review_list_before_change = change.before.val() || [];
      const review_list_after_change = change.after.val() || [];

      const newReview = _.first(_.difference(review_list_after_change, review_list_before_change));
      // If un-follow we exit the function.
      if (!newReview) {
        return;
      }

      console.log(`New review for ${newReview.place_name} published by ${newReview.reviewer_id}`);

      const reviewer = await admin.auth().getUser(newReview.reviewer_id);

      // Get the list of users to notify
      let payloads = [];
      const usersSnapshot = await admin.database().ref(`/users`).once('value');
      usersSnapshot.forEach((snap)=>{
        const user = snap.val();
        if(_.indexOf(user.following, newReview.reviewer_id) >= 0){
          if(user.push_tokens){
            payloads.push({
              // Notification details payload
              to: user.push_tokens,
              title: 'New review alert!',
              body: `${reviewer.displayName} posted a new review for ${newReview.place_name} giving it ${newReview.avg_rating} stars.`
            });
          }
        }
      });

      // Check if there are any device tokens.
      if (!payloads || payloads.length === 0) {
        console.log('There are no notifications to be sent.');
        return;
      }

      console.log(`There are ${tokens.length} tokens to send notifications to.`);

      // Send notifications to all tokens.
      try{
        const response = await _sendExpoTokenRequest(payloads);

        if(response.errors){
          console.error(response.errors);
        }

        if(response.data){
          response.data.forEach(item =>{
            if(item.status === 'error'){
              console.error('error: ' + item.message);
            }
          })
        }
      } catch (ex){
        console.error(ex);
      }
});