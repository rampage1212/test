import { collection, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types/user';

const USERS_COLLECTION = 'users';

export async function getUsers(): Promise<User[]> {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

export async function getUser(id: string): Promise<User | null> {
  const docRef = doc(db, USERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as User;
  }
  
  return null;
}

export async function updateUserStatus(userId: string, status: User['status']) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    status,
    lastActive: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
}