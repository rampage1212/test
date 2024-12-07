import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '@/types/database';

export interface UserWithId extends User {
  id: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as User
        }));
        setUsers(userData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { users, loading, error };
}