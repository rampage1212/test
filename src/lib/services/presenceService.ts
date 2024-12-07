import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '@/types/database';
import { visitOffice, leaveOffice } from './roomService';

const PRESENCE_COLLECTION = 'presence';

export async function updatePresence(
  userId: string,
  status: User['status']
) {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
  
  try {
    await setDoc(presenceRef, {
      userId,
      status,
      lastActive: Timestamp.now(),
      device: 'web',
      connectionId: crypto.randomUUID(),
      lastSeen: Timestamp.now()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating presence:', error);
    throw error;
  }
}

export async function handleVisitOffice(userId: string, officeId: string) {
  try {
    // Update presence status
    await updatePresence(userId, 'online');
    
    // Update office occupancy
    await visitOffice(userId, officeId);
    
    return true;
  } catch (error) {
    console.error('Error visiting office:', error);
    throw error;
  }
}

export async function handleLeaveOffice(userId: string, officeId: string) {
  try {
    // Update presence status
    await updatePresence(userId, 'offline');
    
    // Update office occupancy
    await leaveOffice(userId, officeId);
    
    return true;
  } catch (error) {
    console.error('Error leaving office:', error);
    throw error;
  }
}

export async function updateLastSeen(userId: string) {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
  
  try {
    await updateDoc(presenceRef, {
      lastSeen: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating last seen:', error);
    throw error;
  }
}