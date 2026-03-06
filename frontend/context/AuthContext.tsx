'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider } from '@/lib/firebase';
import { authService } from '@/services/authService';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        setFirebaseUser(fbUser);
        const dbUser = await authService.googleAuth();
        setUser(dbUser);
      } catch (error) {
        console.error('Error syncing user:', error);
        setUser(null);
      }
    } else {
      setFirebaseUser(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), syncUser);
    return () => unsubscribe();
  }, [syncUser]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(getFirebaseAuth());
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
