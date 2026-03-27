import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Vercel deployment, we use environment variables.
// These MUST be set in the Vercel Project Settings -> Environment Variables.

const firebaseConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
};

// Fallback for local development (AI Studio)
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
  try {
    // Using new Function to completely hide the string literal from Vite's static analysis.
    // This prevents the "Could not resolve" error during production builds on Vercel.
    const loadConfig = new Function('return import("../firebase-applet-config.json")');
    const config = await loadConfig();
    if (config && config.default) {
      Object.assign(firebaseConfig, config.default);
    }
  } catch (e) {
    // Expected if file is missing
  }
}

// Check if we have a valid config before initializing
if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key is missing. Please check your environment variables.');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
