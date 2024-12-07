import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { Room } from '@/types/database';

export interface RoomWithId extends Room {
  id: string;
}

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const roomData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as RoomWithId));
          
          setRooms(roomData);
          setError(null);
        } catch (err) {
          console.error('Error processing room data:', err);
          setError(err instanceof Error ? err : new Error('Failed to process room data'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in room subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
}