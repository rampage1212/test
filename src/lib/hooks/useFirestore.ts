import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Room, User } from '@/types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData: Room[] = [];
      snapshot.forEach((doc) => {
        roomData.push({ id: doc.id, ...doc.data() } as Room);
      });
      setRooms(roomData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { rooms, loading };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData: User[] = [];
      snapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}

export function usePresence(userId: string) {
  const [status, setStatus] = useState<'online' | 'offline' | 'away'>('offline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const presenceRef = doc(db, 'presence', userId);
    
    const unsubscribe = onSnapshot(presenceRef, (doc) => {
      if (doc.exists()) {
        setStatus(doc.data().status);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { status, loading };
}

export function useStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statsRef = doc(db, 'stats', 'current');
    
    const unsubscribe = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setStats(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { stats, loading };
}