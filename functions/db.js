const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp();
}

// Database name: use default for emulator, 'learn-db' for production
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const databaseId = isEmulator ? '(default)' : (process.env.FIRESTORE_DATABASE_ID || 'learn-db');
const db = getFirestore(databaseId);

module.exports = { admin, db };
