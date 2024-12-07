import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB8PNaJABRLCBHgw4mdyWwHmu-PbEy8KhM",
  authDomain: "virtualoffice-743e6.firebaseapp.com",
  projectId: "virtualoffice-743e6",
  storageBucket: "virtualoffice-743e6.firebasestorage.app",
  messagingSenderId: "657406371035",
  appId: "1:657406371035:web:5c8f2942d3c29ff42918fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence and multi-tab support
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Authentication with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export { db, storage, auth };