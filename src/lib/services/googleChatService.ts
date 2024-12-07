import { getGoogleAccessToken } from './googleAuthService';
import type { ChatSpace, ChatMessage } from '@/types/chat';

const GOOGLE_CHAT_API = 'https://chat.googleapis.com/v1';

export async function createSpace(name: string, type: 'ROOM' | 'DM' = 'DM'): Promise<ChatSpace> {
  try {
    const accessToken = await getGoogleAccessToken();
    
    const response = await fetch(`${GOOGLE_CHAT_API}/spaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName: name,
        spaceType: type === 'DM' ? 'DIRECT_MESSAGE' : 'ROOM',
        spaceDetails: {
          spaceThreadingState: type === 'ROOM' ? 'THREADED' : 'UNTHREADED'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create chat space');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating space:', error);
    throw error;
  }
}

export async function sendMessage(spaceId: string, text: string): Promise<ChatMessage> {
  try {
    const accessToken = await getGoogleAccessToken();
    
    const response = await fetch(`${GOOGLE_CHAT_API}/spaces/${spaceId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function listMessages(spaceId: string): Promise<ChatMessage[]> {
  try {
    const accessToken = await getGoogleAccessToken();
    
    const response = await fetch(`${GOOGLE_CHAT_API}/spaces/${spaceId}/messages?pageSize=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(error.error?.message || error.message || 'Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}