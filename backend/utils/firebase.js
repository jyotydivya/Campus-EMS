const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

let firebaseInitialized = false;

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase service account file not found. Notifications disabled.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

const sendFirebaseEmail = async (to, subject, html) => {
  try {
    if (!firebaseInitialized) {
      console.log('Firebase not initialized. Cannot send Firebase email.');
      return;
    }
    await admin.firestore().collection('mail').add({
      to: to,
      message: {
        subject: subject,
        html: html
      }
    });
    console.log('Firebase email queued in Firestore (mail collection).');
  } catch (error) {
    console.error('Error queuing Firebase email:', error.message);
  }
};

const sendNotificationToTopic = async (topic, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      console.log(`Firebase not initialized. Skipping notification to topic: ${topic}`);
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      topic,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = { sendNotificationToTopic, sendFirebaseEmail };