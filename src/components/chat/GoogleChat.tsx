import { useState, useRef, useEffect } from 'react';
import { useGoogleChat } from '@/hooks/useGoogleChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserAvatar } from '../office/UserAvatar';

interface GoogleChatProps {
  roomId: string;
}

export function GoogleChat({ roomId }: GoogleChatProps) {
  const { messages, loading, error, sendMessage } = useGoogleChat(roomId);
  const { userData: currentUser } = useAuthContext();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      await sendMessage(text);
      setMessageText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive text-center">Failed to load messages</p>
        <p className="text-sm text-muted-foreground text-center">
          Please ensure you have granted the necessary permissions for Google Chat
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender?.email === currentUser?.email;
            const showAvatar = index === 0 || 
              messages[index - 1]?.sender?.email !== message.sender?.email;

            return (
              <div
                key={message.name}
                className={`flex items-end gap-2 ${
                  isCurrentUser ? 'flex-row-reverse' : ''
                }`}
              >
                {showAvatar && message.sender && (
                  <UserAvatar
                    user={{
                      name: message.sender.displayName || 'Unknown',
                      email: message.sender.email || '',
                      avatar: message.sender.avatarUrl || '',
                      status: 'online'
                    }}
                    className="h-8 w-8"
                  />
                )}
                <div
                  className={`group relative rounded-lg px-3 py-2 max-w-[70%] ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {showAvatar && (
                    <p className="text-xs font-medium mb-1">
                      {message.sender?.displayName || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
          >
            <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}