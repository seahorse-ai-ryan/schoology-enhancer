// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "schoology-testing.firebaseapp.com",
  projectId: "schoology-testing",
  storageBucket: "schoology-testing.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id",
};

// Initialize Firebase for server-side and client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator might already be connected
    console.log('Firestore emulator connection:', error);
  }
}

export { db };
