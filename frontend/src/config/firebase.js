import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const useEmulators = process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_EMULATORS === 'true';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyAD4NKP11nk4yQCT5y49zKnzUI8gSvDu0o',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'learn-made-fun.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'learn-made-fun',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'learn-made-fun.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '528113964740',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:528113964740:web:55377421b133345da61b91',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Database name from env, defaults to 'learn-db'
const databaseId = process.env.REACT_APP_FIRESTORE_DATABASE_ID || 'learn-db';
export const db = getFirestore(app, databaseId);

// Connect to emulators in development
if (useEmulators) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firebase emulators');
  } catch (e) {
    // Emulators already connected
  }
}

export default app;
