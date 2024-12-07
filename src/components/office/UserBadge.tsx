import { User } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserBadgeProps {
  user: User;
  isAssigned?: boolean;
  isPresent?: boolean;
  className?: string;
}

export function UserBadge({ 
  user, 
  isAssigned, 
  isPresent,
  className 
}: UserBadgeProps) {
  const getStatusColor = () => {
    if (isPresent) return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
    if (isAssigned) return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
    return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30';
  };

  const getStatusText = () => {
    if (isPresent) return 'Present';
    if (isAssigned) return 'Assigned';
    return 'Visiting';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-2 p-1 rounded-lg transition-colors",
          getStatusColor(),
          className
        )}>
          <UserAvatar 
            user={user} 
            className="h-8 w-8"
            showPresence={false}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user.name}
            </span>
            <Badge 
              variant="secondary" 
              className={cn(
                "h-5 px-1.5",
                getStatusColor()
              )}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground">{user.role}</p>
          {user.department && (
            <p className="text-muted-foreground">{user.department}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}