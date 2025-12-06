const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Get Firestore instance
const db = admin.firestore();

// Get JWT secret from Firebase Functions config or environment
const getJwtSecret = () => {
  // Try Firebase Functions config first
  if (functions.config().jwt && functions.config().jwt.secret) {
    return functions.config().jwt.secret;
  }
  // Fall back to environment variable (for emulator)
  return process.env.JWT_SECRET || 'dev-secret-change-in-production';
};

module.exports = {
  db,
  jwtSecret: getJwtSecret()
};
