import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { listMessages, sendMessage as sendChatMessage } from '@/lib/services/googleChatService';
import type { ChatMessage } from '@/types/chat';

export function useGoogleChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const fetchedMessages = await listMessages(roomId);
      setMessages(fetchedMessages);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Fetch messages on mount and periodically
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const initFetch = async () => {
      if (!mounted) return;
      await fetchMessages();
      
      // Poll for new messages every 5 seconds
      interval = setInterval(fetchMessages, 5000);
    };

    initFetch();

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchMessages]);

  const sendMessage = async (text: string) => {
    try {
      await sendChatMessage(roomId, text);
      // Immediately fetch messages to show the new message
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: fetchMessages,
  };
}