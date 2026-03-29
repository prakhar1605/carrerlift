/**
 * firebase.js — Google Sign-In auth for Carrerlift
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  apiKey           : 'AIzaSyDE9OpF9wSpUppgGsnOLx4oO2bxz88MfAg',
  authDomain       : 'carrerlift-46528.firebaseapp.com',
  projectId        : 'carrerlift-46528',
  storageBucket    : 'carrerlift-46528.firebasestorage.app',
  messagingSenderId: '230640648721',
  appId            : '1:230640648721:web:abb0c6d9691d1c91f3a7b0',
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return null;
    throw err;
  }
}

export async function signOutUser() {
  await fbSignOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}
