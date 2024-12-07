import { Room } from '@/types/database';
import { BaseRoomCard } from './BaseRoomCard';

interface TeamRoomProps {
  room: Room;
  isEditMode?: boolean;
  onNameChange?: (newName: string) => void;
  onAssignUser?: (index: number, userId: string | null) => void;
  onDelete?: () => void;
}

export function TeamRoom({ 
  room, 
  isEditMode,
  onNameChange,
  onAssignUser,
  onDelete
}: TeamRoomProps) {
  return (
    <BaseRoomCard 
      room={room} 
      isEditMode={isEditMode}
      onNameChange={onNameChange}
      onAssignUser={onAssignUser}
      onDelete={onDelete}
      maxDisplayAvatars={4}
    />
  );
}