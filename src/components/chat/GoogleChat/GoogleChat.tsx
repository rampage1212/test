import { useEffect, useRef } from 'react';
import { useGoogleChat } from '@/hooks/useGoogleChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

interface GoogleChatProps {
  roomId: string;
}

export function GoogleChat({ roomId }: GoogleChatProps) {
  const { messages, loading, error, sendMessage } = useGoogleChat(roomId);
  const { userData } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = inputRef.current?.value.trim();
    if (!text) return;

    sendMessage(text);
    if (inputRef.current) {
      inputRef.current.value = '';
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender.name === userData?.email
                  ? 'flex-row-reverse'
                  : ''
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  message.sender.name === userData?.email
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {message.sender.displayName}
                </p>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}