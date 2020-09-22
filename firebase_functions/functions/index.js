'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = require('lodash');
const fetch = require('node-fetch');

admin.initializeApp();

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
      let tokens = [];
      const usersSnapshot = await admin.database().ref(`/users`).once('value');
      usersSnapshot.forEach((snap)=>{
        const user = snap.val();
        if(_.indexOf(user.following, newReview.reviewer_id) >= 0){
          if(user.push_tokens){
            tokens.concat(user.push_tokens);
          }
        }
      });

      // Check if there are any device tokens.
      if (!tokens || tokens.length === 0) {
        return console.log('There are no notification tokens to send to.');
      }
      console.log(`There are ${tokens.length} tokens to send notifications to.`);

      // Notification details.
      const payload = {
        notification: {
          title: `New review alert!`,
          body: `${reviewer.displayName} posted a new review for ${newReview.place_name} giving it ${newReview.avg_rating} stars.`
        }
      };

      // Send notifications to all tokens.
      const response = await admin.messaging().sendToDevice(["6a6141c842f60735cd3d3c35ece4ddabaa8097fbb310da5280beb0843b4cc9aa"], payload);
      // For each message check if there was an error.
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokens[index], error);
          // Cleanup the tokens who are not registered anymore.
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            // TODO:
          }
        }
      });
    });
