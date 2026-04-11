'use client';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { FIREBASE_CONFIG } from './config';

const app  = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const r = await signInWithPopup(auth, provider);
    return r.user;
  } catch (e: any) {
    if (e.code === 'auth/popup-closed-by-user') return null;
    throw e;
  }
}
export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb: (u: User | null) => void) => onAuthStateChanged(auth, cb);
export const getCurrentUser = () => auth.currentUser;
export { auth };
