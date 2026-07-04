// src/context/AuthContext.js
//
// Two distinct failure states this app needs to tell apart, because they
// need different messaging:
//   1. Not logged in at all              -> show login screen
//   2. Logged in, but NO admin claim     -> show "you don't have access"
//      (this matters: a regular business-owner Firebase account from the
//      POS app could accidentally land here and should get a clear
//      "this isn't for you" message, not a silent redirect loop)
//
// The admin claim is read from the DECODED ID TOKEN (getIdTokenResult),
// not from a Firestore field — see backend chunk 1's adminAuth.js comment
// for why (custom claims are signed by Firebase, can't be client-forged).

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' | 'superadmin' | null
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAdminClaim = useCallback(async (user) => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      return;
    }
    try {
      // forceRefresh: true — claims can change (you might grant/revoke
      // admin while this tab is open); cheap enough to always check fresh
      // on auth state changes rather than trust a stale cached token.
      const result = await user.getIdTokenResult(true);
      const claims = result.claims;
      setIsAdmin(claims.admin === true || claims.role === 'superadmin');
      setAdminRole(claims.role || (claims.admin ? 'admin' : null));
    } catch (e) {
      console.error('Failed to read admin claim:', e);
      setIsAdmin(false);
      setAdminRole(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await checkAdminClaim(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [checkAdminClaim]);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminClaim(cred.user);
      return true;
    } catch (e) {
      const message =
        e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found'
          ? 'Incorrect email or password.'
          : e.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please wait a moment and try again.'
            : 'Sign in failed. Please try again.';
      setAuthError(message);
      return false;
    }
  }, [checkAdminClaim]);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setAdminRole(null);
  }, []);

  const value = {
    firebaseUser,
    isAdmin,
    adminRole,
    isLoading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
