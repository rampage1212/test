import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export function useEmployees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'employees'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const employeeData: User[] = [];
        snapshot.forEach((doc) => {
          employeeData.push({
            id: doc.id,
            ...doc.data(),
          } as User);
        });
        setEmployees(employeeData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employees:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { employees, loading, error };
}