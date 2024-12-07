import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Google Auth client
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/chat.spaces']
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8888'],
  credentials: true
}));
app.use(express.json());

app.post('/api/google-chat', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified for user:', decodedToken.uid);

    // Get Google OAuth token using service account
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('Failed to get Google access token');
    }

    console.log('Access token obtained');
    res.json({ accessToken: accessToken.token });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
});
