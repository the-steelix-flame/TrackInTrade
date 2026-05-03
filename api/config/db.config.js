const admin = require('firebase-admin');

let serviceAccount;

// Check if we are in production (Vercel) with an environment variable
if (process.env.FIREBASE_CREDENTIALS) {
  try {
    // Parse the stringified JSON from Vercel back into an object
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } catch (error) {
    console.error("Failed to parse FIREBASE_CREDENTIALS env variable:", error);
  }
} else {
  // Fallback for local development
  serviceAccount = require('./firebaseServiceAccount.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db };