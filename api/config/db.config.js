const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- NEW: Tell Firestore to safely ignore 'undefined' fields ---
db.settings({ ignoreUndefinedProperties: true });

console.log("🔥 Firebase Firestore connected successfully");

module.exports = { db };