import { Room } from '@/types/database';
import { BaseRoomCard } from './BaseRoomCard';
import { Video } from 'lucide-react';

interface MeetingRoomProps {
  room: Room;
  isEditMode?: boolean;
  onNameChange?: (newName: string) => void;
  onDelete?: () => void;
}

export function MeetingRoom({ 
  room, 
  isEditMode,
  onNameChange,
  onDelete
}: MeetingRoomProps) {
  return (
    <BaseRoomCard 
      room={room} 
      isEditMode={isEditMode}
      onNameChange={onNameChange}
      onDelete={onDelete}
      maxDisplayAvatars={4}
      icon={<Video className="h-4 w-4 text-muted-foreground absolute top-2 right-2" />}
    />
  );
}