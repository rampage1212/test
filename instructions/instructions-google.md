# Google Integration Documentation for Virtual Office

## Table of Contents
1. [Google Authentication System](#google-authentication-system)
2. [Google Chat Integration](#google-chat-integration)
3. [UI Components](#ui-components)
4. [Authentication Flow](#authentication-flow)
5. [Security Measures](#security-measures)
6. [Error Handling](#error-handling)
7. [Integration Points](#integration-points)
8. [Dependencies](#dependencies)

## Google Authentication System
Implementation in `googleAuthService.ts`:
- Uses Firebase Authentication with Google provider
- Implements token management system:
  - Caches access tokens
  - Handles token expiration
  - Automatic token refresh
- Scopes:
  - Primary: 'https://www.googleapis.com/auth/chat.spaces'
- Security features:
  - CSRF protection using state parameter
  - Offline access support
  - Consent prompt handling

## Google Chat Integration
Implementation in `googleChatService.ts`:
- API Endpoint: 'https://chat.googleapis.com/v1'
- Features:
  ### Space Management:
  - Create chat spaces (ROOM or DM)
  - Support for threaded/unthreaded conversations
  ### Messaging:
  - Send messages
  - List messages (paginated, 100 per request)
  - Real-time updates

## UI Components
`GoogleChat.tsx` Component:
- Real-time chat interface
- Features:
  - Message scrolling with auto-scroll
  - Message input with Enter key support
  - Sender/receiver message differentiation
  - Loading states
  - Error handling

## Authentication Flow
1. User initiates Google sign-in
2. Firebase handles OAuth popup
3. Token exchange process:
   - Firebase token → Google OAuth token
   - Uses Netlify Functions as middleware
4. Token management:
   - Caching mechanism
   - Automatic refresh
   - Scope-specific permissions

## Security Measures
- Token-based authentication
- CSRF protection
- Secure token exchange
- Scope-based permissions
- Server-side validation

## Error Handling
- Token refresh failures
- Permission request failures
- API call failures
- Network errors
- UI error states

## Integration Points
### Authentication:
- Firebase Authentication
- Google OAuth
- Custom token exchange

### Chat:
- Google Chat API
- Real-time messaging
- Space management

### Middleware:
- Netlify Functions
- Token exchange
- Permission management

## Dependencies
- Firebase Auth
- Google Chat API
- Netlify Functions
- React Components
- Custom Hooks (useGoogleChat)

## Setup Instructions
1. Configure Firebase Project:
   - Enable Google Authentication
   - Set up Firebase project credentials
   - Configure authorized domains

2. Google Cloud Setup:
   - Enable Google Chat API
   - Create OAuth 2.0 credentials
   - Configure authorized redirect URIs

3. Netlify Configuration:
   - Deploy Netlify Functions
   - Set up environment variables
   - Configure build settings

4. Local Development:
   - Install dependencies
   - Set up environment variables
   - Configure local Firebase emulators (optional)
