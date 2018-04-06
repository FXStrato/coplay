// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

exports.handleSkip = functions.https.onCall((data, context) => {
  const room = data.room;
  let newnp = data.np;
  if(newnp) {
    newnp.seek = 0;
  }
  return admin.firestore().collection('rooms').doc(room).update({np: newnp || {}}).then(res => {
    // Send back a message that we've succesfully written
    return {result: "Successfully wrote np"};
  }).catch(err => {
    return err;
  });
});
