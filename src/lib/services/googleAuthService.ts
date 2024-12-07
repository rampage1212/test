import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const CHAT_SCOPE = 'https://www.googleapis.com/auth/chat.spaces';

// Use LOCAL_REDIRECT_URI for development, fallback to Netlify path in production
const API_URL = import.meta.env.VITE_LOCAL_REDIRECT_URI || '/.netlify/functions/google-chat';

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

export async function getGoogleAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  // Get the current Firebase user
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // Get a fresh ID token from Firebase
    const idToken = await currentUser.getIdToken();

    // Exchange Firebase token for Google OAuth token
    console.log('Making request to:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', response.status, errorText);
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.accessToken) {
      console.error('Invalid server response:', data);
      throw new Error('Server response missing access token');
    }
    cachedToken = data.accessToken;
    tokenExpiration = Date.now() + 3600000; // 1 hour expiration
    return data.accessToken;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    throw error;
  }
}

export async function requestChatPermissions(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.addScope(CHAT_SCOPE);
  
  // Generate state parameter with user ID for CSRF protection
  const state = Buffer.from(JSON.stringify({
    uid: auth.currentUser?.uid,
    timestamp: Date.now()
  })).toString('base64');

  // Add state to provider
  provider.setCustomParameters({
    state,
    prompt: 'consent',
    access_type: 'offline'
  });
  
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error requesting Chat permissions:', error);
    throw error;
  }
}