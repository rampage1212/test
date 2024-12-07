import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChange } from '@/lib/services/authService';
import { db } from '@/lib/firebase';
import { User } from '@/types/database';

export interface AuthState {
  authUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChange((user) => {
      setAuthUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    if (authUser) {
      const userRef = doc(db, 'users', authUser.uid);
      unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() } as User);
        }
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [authUser]);

  return { authUser, userData, loading };
}