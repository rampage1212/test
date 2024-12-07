import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { updateUserStatus } from './userService';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

async function createOrUpdateUser(user: User) {
  if (!db) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
    
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      role: 'Member',
      department: '',
      status: 'online',
      isAdmin: false,
      lastActive: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } else {
    // Update last active and status
    await updateUserStatus(user.uid, 'online');
  }
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUser(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(
        'This domain is not authorized for Google sign-in. Please contact your administrator.'
      );
    }
    throw error;
  }
}

export async function login(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateUserStatus(userCredential.user.uid, 'online');
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function logout() {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }

  try {
    const user = auth.currentUser;
    if (user) {
      await updateUserStatus(user.uid, 'offline');
    }
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth) {
    console.warn('Firebase auth is not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}