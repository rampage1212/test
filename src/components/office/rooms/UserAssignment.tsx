import { useUsers } from '@/lib/hooks/useUsers';
import { UserAvatar } from '../UserAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X } from 'lucide-react';

interface UserAssignmentProps {
  index: number;
  assignedUserId?: string;
  onAssign: (userId: string | null) => void;
}

export function UserAssignment({ index, assignedUserId, onAssign }: UserAssignmentProps) {
  const { users, loading } = useUsers();
  
  // Find the assigned user by their Firestore document ID
  const assignedUser = users.find(u => u.id === assignedUserId);

  if (loading) {
    return (
      <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
    );
  }

  // If we have an assigned user, show their avatar with remove option
  if (assignedUser) {
    return (
      <div className="relative group">
        <UserAvatar 
          user={assignedUser} 
          className="h-16 w-16 grayscale hover:grayscale-0 transition-all"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute inset-0 m-auto h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onAssign(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show dropdown with available users
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-16 w-16 rounded-full border-dashed"
        >
          Assign
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {users
          // Filter out users who are already assigned to other seats
          .filter(user => !assignedUserId || user.id !== assignedUserId)
          .map((user) => (
            <DropdownMenuItem
              key={user.id}
              className="flex items-center gap-2"
              onClick={() => onAssign(user.id)}
            >
              <UserAvatar user={user} className="h-8 w-8" />
              <span>{user.name}</span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}