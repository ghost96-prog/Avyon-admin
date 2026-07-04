// src/services/firebase.js
//
// Same Firebase PROJECT as your POS app and backend — admins are just
// Firebase Auth users with an `admin: true` / `role: 'superadmin'`
// custom claim set via scripts/setAdminClaim.js (backend chunk 1).
//
// ⚠️ Fill in your actual Firebase config values below. These are public
// client config values (not secrets) — same ones your mobile app's
// firebase.js / firebase config already uses.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
