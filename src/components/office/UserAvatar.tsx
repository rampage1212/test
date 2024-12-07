import { User } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

interface UserAvatarProps {
  user: User;
  className?: string;
  showPresence?: boolean;
}

export function UserAvatar({ user, className, showPresence = true }: UserAvatarProps) {
  // Generate initials safely, handling undefined name
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name.split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'busy': return 'text-red-500';
      case 'away': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const isOffline = user.status === 'offline';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Avatar 
            className={cn(
              "border-2 border-background",
              isOffline && "grayscale opacity-50",
              className
            )}
          >
            {user.avatar && (
              <AvatarImage 
                src={user.avatar} 
                alt={user.name || 'User'} 
              />
            )}
            <AvatarFallback>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {showPresence && (
            <Circle 
              className={cn(
                "absolute bottom-0 left-0 h-3 w-3 rounded-full ring-2 ring-background",
                getStatusColor(user.status)
              )}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{user.name || 'Unnamed User'}</p>
        {user.department && (
          <p className="text-xs text-muted-foreground">{user.department}</p>
        )}
        <p className="text-xs text-muted-foreground capitalize">
          Status: {user.status}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}