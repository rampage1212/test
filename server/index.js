import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { auth, db } from './firebase-admin.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://virtualoffice.netlify.app'
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Middleware to verify Firebase ID token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Token exchange endpoint
app.post('/api/auth/google-token', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's stored refresh token from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.googleRefreshToken) {
      return res.status(400).json({ 
        error: 'No refresh token found',
        message: 'User needs to reauthorize'
      });
    }

    // Exchange refresh token for access token
    const { tokens } = await oauth2Client.refreshToken(userData.googleRefreshToken);
    
    res.json({
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date ? 
        Math.floor((tokens.expiry_date - Date.now()) / 1000) : 
        3600
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Auth server running on port ${port}`);
});