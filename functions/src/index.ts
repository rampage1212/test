import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

admin.initializeApp();

const SCOPES = ['https://www.googleapis.com/auth/chat.spaces'];

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Exchange Firebase token for Google Chat token
export const getGoogleChatToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData?.googleRefreshToken) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User needs to reauthorize with Google Chat'
      );
    }

    // Exchange refresh token for access token
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);
    
    return {
      accessToken: tokens.access_token,
      expiresIn: tokens.expiry_date ? 
        Math.floor((tokens.expiry_date - Date.now()) / 1000) : 
        3600
    };
  } catch (error) {
    console.error('Error getting Google Chat token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get Google Chat token'
    );
  }
});

// Create a Google Chat space
export const createChatSpace = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { name, type = 'ROOM', members = [] } = data;
    
    if (!name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Space name is required'
      );
    }

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData?.googleRefreshToken) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User needs to reauthorize with Google Chat'
      );
    }

    // Get fresh access token
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);
    const chat = google.chat({ version: 'v1', auth: oauth2Client });

    // Create space
    const space = await chat.spaces.create({
      requestBody: {
        displayName: name,
        spaceType: type,
        spaceDetails: {
          spaceThreadingState: type === 'ROOM' ? 'THREADED' : 'UNTHREADED'
        }
      }
    });

    // Add members if provided
    if (members.length > 0 && space.data.name) {
      await Promise.all(members.map(async (memberId: string) => {
        const memberDoc = await admin.firestore()
          .collection('users')
          .doc(memberId)
          .get();
        
        const memberData = memberDoc.data();
        if (memberData?.email) {
          await chat.spaces.members.create({
            parent: space.data.name,
            requestBody: {
              member: {
                name: memberData.email,
                type: 'HUMAN'
              }
            }
          });
        }
      }));
    }

    return space.data;
  } catch (error) {
    console.error('Error creating chat space:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create chat space'
    );
  }
});

// Send a message to a Google Chat space
export const sendChatMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { spaceId, text } = data;
    
    if (!spaceId || !text) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Space ID and message text are required'
      );
    }

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData?.googleRefreshToken) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User needs to reauthorize with Google Chat'
      );
    }

    // Get fresh access token
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);
    const chat = google.chat({ version: 'v1', auth: oauth2Client });

    // Send message
    const message = await chat.spaces.messages.create({
      parent: spaceId,
      requestBody: { text }
    });

    return message.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send message'
    );
  }
});

// List messages in a Google Chat space
export const listChatMessages = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { spaceId, pageSize = 50, pageToken } = data;
    
    if (!spaceId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Space ID is required'
      );
    }

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData?.googleRefreshToken) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User needs to reauthorize with Google Chat'
      );
    }

    // Get fresh access token
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);
    const chat = google.chat({ version: 'v1', auth: oauth2Client });

    // List messages
    const messages = await chat.spaces.messages.list({
      parent: spaceId,
      pageSize,
      pageToken
    });

    return messages.data;
  } catch (error) {
    console.error('Error listing chat messages:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to list messages'
    );
  }
});