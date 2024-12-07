## Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `virtualoffice-743e6`
3. Navigate to Authentication > Settings > Authorized domains
4. Add the domain: `clever-cendol-73adcf.netlify.app`

This allows Google Sign-in to work properly on the deployed Netlify site.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=your-redirect-uri
```

Replace all placeholder values with your actual credentials. Never commit the `.env` file to version control.