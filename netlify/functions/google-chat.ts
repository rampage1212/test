import { Handler } from '@netlify/functions';
import { OAuth2Client } from 'google-auth-library';
import { admin } from './firebase-admin';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Add required scopes for Google Chat API
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.messages'
];

export const handler: Handler = async (event, context) => {
  console.log('Received event:', event);

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  try {
    console.log('Verifying Firebase ID token');
    // Verify Firebase ID token
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No token provided');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token provided' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified for UID:', decodedToken.uid);

    const uid = decodedToken.uid;

    // Get user's stored refresh token from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.googleRefreshToken) {
      console.log('No refresh token found for UID:', uid);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No refresh token found',
          message: 'User needs to reauthorize'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    // Set up OAuth2Client with refresh token
    oauth2Client.setCredentials({
      refresh_token: userData.googleRefreshToken
    });

    // Exchange refresh token for access token with required scopes
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);

    // Verify we have all required scopes
    const grantedScopes = tokens.scope?.split(' ') || [];
    const hasChatScopes = REQUIRED_SCOPES.every(scope => 
      grantedScopes.includes(scope)
    );

    if (!hasChatScopes) {
      console.log('Insufficient permissions for UID:', uid);
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Insufficient permissions',
          message: 'Missing required Google Chat scopes'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    console.log('Returning success response for UID:', uid);
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: tokens.access_token,
        expires_in: tokens.expiry_date ? 
          Math.floor((tokens.expiry_date - Date.now()) / 1000) : 
          3600
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  } catch (error) {
    console.error('Error during token exchange:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to exchange token',
        message: error.message 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }
};