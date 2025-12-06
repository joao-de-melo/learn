const admin = require('firebase-admin');

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

module.exports = { admin, db };
