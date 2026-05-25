import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { UserProfile, UserRole } from '@/src/types';
import { handleFirestoreError, OperationType } from '@/src/lib/error-handler';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // New user registration (Default: Resident)
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Resident',
              role: 'Resident',
              createdAt: new Date().toISOString(),
              status: 'Available'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error: any) {
          console.warn('Failed to load user profile (offline mode fallback activated):', error);
          // Fallback user state so app can function locally offline
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Offline User',
            role: 'Resident',
            createdAt: new Date().toISOString(),
            status: 'Available'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
