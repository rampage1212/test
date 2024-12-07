import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { useAuthContext } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '../office/UserAvatar';
import { Search, Loader2 } from 'lucide-react';
import { GoogleChat } from './GoogleChat';
import { createSpace } from '@/lib/services/googleChatService';
import { useToast } from '@/components/ui/use-toast';

interface DirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DirectMessageDialog({ open, onOpenChange }: DirectMessageDialogProps) {
  const { users, loading } = useUsers();
  const { userData: currentUser } = useAuthContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [creatingSpace, setCreatingSpace] = useState(false);

  // Filter out current user and search by name or email
  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
     user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUserSelect = async (userId: string) => {
    try {
      setCreatingSpace(true);
      setSelectedUser(userId);
      
      const selectedUserData = users.find(u => u.id === userId);
      if (!selectedUserData || !currentUser) {
        throw new Error('User data not found');
      }

      // Create a unique space name for the DM
      const spaceName = `DM: ${currentUser.name} - ${selectedUserData.name}`;
      
      // Create a direct message space
      const space = await createSpace(spaceName, 'DM');
      
      if (!space?.name) {
        throw new Error('Failed to create chat space');
      }

      setSpaceId(space.name);
    } catch (error) {
      console.error('Error creating chat space:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create chat. Please try again.",
        variant: "destructive"
      });
      setSelectedUser(null);
    } finally {
      setCreatingSpace(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSpaceId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl p-0"
        aria-describedby="message-dialog-description"
      >
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Messages</DialogTitle>
          <p id="message-dialog-description" className="sr-only">
            Direct message interface to chat with other users
          </p>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Left sidebar with user search */}
          <div className="w-80 border-r">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(600px-5rem)]">
              <div className="p-2 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    {search ? "No users found" : "No users available"}
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors ${
                        selectedUser === user.id ? 'bg-muted' : ''
                      }`}
                      disabled={creatingSpace}
                    >
                      <UserAvatar user={user} className="h-10 w-10" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side with chat */}
          <div className="flex-1">
            {creatingSpace ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Creating chat space...</p>
              </div>
            ) : selectedUser && spaceId ? (
              <GoogleChat roomId={spaceId} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}