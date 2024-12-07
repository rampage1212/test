import { Room } from '@/types';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { 
  Users, 
  Video, 
  Coffee,
  MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoomCardProps {
  room: Room;
  className?: string;
}

const roomTypeIcons = {
  office: Users,
  meeting: Video,
  common: Coffee,
};

export function RoomCard({ room, className }: RoomCardProps) {
  const Icon = roomTypeIcons[room.type];

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border/40 bg-card p-4',
        'hover:border-primary/40 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{room.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Join Room</DropdownMenuItem>
            <DropdownMenuItem>Start Meeting</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {room.occupants.map((user) => (
          <UserAvatar key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}