import { getFunctions, httpsCallable } from 'firebase/functions';
import type { ChatSpace, ChatMessage } from '@/types/chat';

const functions = getFunctions();

export const createChatSpace = async (
  name: string,
  type: 'ROOM' | 'DM' = 'ROOM',
  members: string[] = []
): Promise<ChatSpace> => {
  try {
    const createSpace = httpsCallable(functions, 'createChatSpace');
    const result = await createSpace({ name, type, members });
    return result.data as ChatSpace;
  } catch (error) {
    console.error('Error creating chat space:', error);
    throw error;
  }
};

export const sendMessage = async (
  spaceId: string,
  text: string
): Promise<ChatMessage> => {
  try {
    const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
    const result = await sendChatMessage({ spaceId, text });
    return result.data as ChatMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const listMessages = async (
  spaceId: string,
  pageSize = 50,
  pageToken?: string
): Promise<ChatMessage[]> => {
  try {
    const listChatMessages = httpsCallable(functions, 'listChatMessages');
    const result = await listChatMessages({ spaceId, pageSize, pageToken });
    return (result.data as any).messages || [];
  } catch (error) {
    console.error('Error listing messages:', error);
    throw error;
  }
};