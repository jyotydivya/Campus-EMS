const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseInitialized = false;

try {
  let serviceAccount = null;

  // 1. First, check if the service account is provided via an Environment Variable (Best for Production/Deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } 
  // 2. Fallback to reading from the local file (Best for Local Development)
  else {
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    console.log('Firebase service account path:', serviceAccountPath);
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase credentials not found (checked ENV and local file). Notifications disabled.');
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
