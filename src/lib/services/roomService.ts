import { 
  collection, 
  doc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  writeBatch, 
  getDoc, 
  runTransaction, 
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Room, RoomUpdate, User, UserUpdate } from '@/types/database';

const ROOMS_COLLECTION = 'rooms';
const USERS_COLLECTION = 'users';

export async function createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now();
    const data = {
      ...roomData,
      assignedUsers: roomData.assignedUsers || [],
      currentOccupants: roomData.currentOccupants || [],
      createdAt: now,
      updatedAt: now,
      maxOccupants: Number(roomData.maxOccupants),
      position: {
        x: Number(roomData.position.x),
        y: Number(roomData.position.y)
      },
      size: {
        w: Number(roomData.size.w),
        h: Number(roomData.size.h)
      }
    };

    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function updateRoom(roomId: string, updates: Partial<Room>) {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const data: RoomUpdate = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (updates.position) {
      data.position = {
        x: Number(updates.position.x),
        y: Number(updates.position.y)
      };
    }

    if (updates.size) {
      data.size = {
        w: Number(updates.size.w),
        h: Number(updates.size.h)
      };
    }

    if (updates.maxOccupants) {
      data.maxOccupants = Number(updates.maxOccupants);
    }

    await updateDoc(roomRef, data);
    return true;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
}

export async function deleteRoom(roomId: string) {
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
    return true;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

export async function assignHomeOffice(userId: string, newOfficeId: string) {
  if (!userId || !newOfficeId) {
    throw new Error('Invalid user or office ID');
  }

  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data() as User;
      const previousOfficeId = userData.homeOfficeId;

      const newOfficeRef = doc(db, ROOMS_COLLECTION, newOfficeId);
      const newOfficeSnap = await transaction.get(newOfficeRef);
      
      if (!newOfficeSnap.exists()) {
        throw new Error('New office not found');
      }

      const newOfficeData = newOfficeSnap.data() as Room;

      if (newOfficeData.assignedUsers.length >= newOfficeData.maxOccupants) {
        throw new Error('Office has reached maximum assigned users');
      }

      if (previousOfficeId && previousOfficeId !== newOfficeId) {
        const prevOfficeRef = doc(db, ROOMS_COLLECTION, previousOfficeId);
        transaction.update(prevOfficeRef, {
          assignedUsers: arrayRemove(userId),
          currentOccupants: arrayRemove(userId),
          updatedAt: Timestamp.now()
        });
      }

      transaction.update(newOfficeRef, {
        assignedUsers: arrayUnion(userId),
        currentOccupants: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });

      transaction.update(userRef, {
        homeOfficeId: newOfficeId,
        currentOfficeId: newOfficeId,
        updatedAt: Timestamp.now()
      });
    });

    return true;
  } catch (error) {
    console.error('Error assigning home office:', error);
    throw error;
  }
}

export async function leaveOffice(userId: string) {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User does not exist.');
      }

      const userData = userSnap.data() as User;
      const currentOfficeId = userData.currentOfficeId;
      const homeOfficeId = userData.homeOfficeId;

      if (!currentOfficeId) {
        throw new Error('User is not currently in any office.');
      }

      if (!homeOfficeId) {
        throw new Error('User does not have a home office.');
      }

      // Remove user from current office's currentOccupants
      const currentOfficeRef = doc(db, ROOMS_COLLECTION, currentOfficeId);
      transaction.update(currentOfficeRef, {
        currentOccupants: arrayRemove(userId),
        updatedAt: Timestamp.now(),
      });

      // Add user to home office's currentOccupants
      const homeOfficeRef = doc(db, ROOMS_COLLECTION, homeOfficeId);
      transaction.update(homeOfficeRef, {
        currentOccupants: arrayUnion(userId),
        updatedAt: Timestamp.now(),
      });

      // Update user's currentOfficeId to homeOfficeId
      transaction.update(userRef, {
        currentOfficeId: homeOfficeId,
        updatedAt: Timestamp.now(),
      });
    });

    return true;
  } catch (error) {
    console.error('Error leaving office:', error);
    throw error;
  }
}

export async function visitOffice(userId: string, newOfficeId: string) {
  if (!userId || !newOfficeId) {
    throw new Error('Invalid user or office ID');
  }

  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data() as User;
      const currentOfficeId = userData.currentOfficeId;

      const newOfficeRef = doc(db, ROOMS_COLLECTION, newOfficeId);
      const newOfficeSnap = await transaction.get(newOfficeRef);
      
      if (!newOfficeSnap.exists()) {
        throw new Error('Office not found');
      }

      const newOfficeData = newOfficeSnap.data() as Room;
      
      if (newOfficeData.currentOccupants.length >= newOfficeData.maxOccupants) {
        throw new Error('Office is at maximum capacity');
      }

      // Check if this is someone's home office
      if (newOfficeData.assignedUsers.length > 0) {
        const assignedUserId = newOfficeData.assignedUsers[0];
        const isAssignedUserPresent = newOfficeData.currentOccupants.includes(assignedUserId);

        // If assigned user is not present, others cannot visit
        if (!isAssignedUserPresent && userId !== assignedUserId) {
          throw new Error('Cannot visit when assigned user is not present');
        }
      }

      if (currentOfficeId && currentOfficeId !== newOfficeId) {
        const currentOfficeRef = doc(db, ROOMS_COLLECTION, currentOfficeId);
        transaction.update(currentOfficeRef, {
          currentOccupants: arrayRemove(userId),
          updatedAt: Timestamp.now()
        });
      }

      transaction.update(newOfficeRef, {
        currentOccupants: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });

      transaction.update(userRef, {
        currentOfficeId: newOfficeId,
        updatedAt: Timestamp.now()
      });
    });

    return true;
  } catch (error) {
    console.error('Error visiting office:', error);
    throw error;
  }
}