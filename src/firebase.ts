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
// We only attempt to load the local config if we are NOT in production
// and if the API key is missing.
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
  try {
    // We use a more obscure way to load the config to hide it from Vite's static analysis
    // This prevents "Could not resolve" errors during the production build on Vercel
    const loadLocal = new Function('return import("../firebase-applet-config.json")');
    const config = await loadLocal();
    if (config && config.default) {
      Object.assign(firebaseConfig, config.default);
    }
  } catch (e) {
    console.warn('Local Firebase configuration missing.');
  }
}

// Check if we have a valid config before initializing
if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key is missing. Please check your environment variables.');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
