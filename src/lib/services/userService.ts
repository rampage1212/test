import { 
  collection,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '@/types/database';

const USERS_COLLECTION = 'users';

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function updateUserStatus(
  userId: string, 
  status: User['status']
) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  try {
    await updateDoc(userRef, {
      status,
      lastActive: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}