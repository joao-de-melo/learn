const admin = require('firebase-admin');
const path = require('path');

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'local';
require('dotenv').config({
  path: path.resolve(__dirname, `../../.env.${env}`)
});

// Initialize Firebase Admin
// For local development with emulator, set FIRESTORE_EMULATOR_HOST
// For production, provide service account credentials

if (process.env.FIRESTORE_EMULATOR_HOST) {
  // Using emulator
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'learn-dev'
  });
  console.log('Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Using service account file
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Using service account JSON from env
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Default init (works in Cloud Run, Cloud Functions, etc.)
  admin.initializeApp();
}

const { getFirestore } = require('firebase-admin/firestore');

// Database name: use default for emulator, 'learn-db' for production
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const databaseId = isEmulator ? '(default)' : (process.env.FIRESTORE_DATABASE_ID || 'learn-db');
const db = getFirestore(databaseId);
console.log('Using Firestore database:', databaseId);

module.exports = { admin, db };
