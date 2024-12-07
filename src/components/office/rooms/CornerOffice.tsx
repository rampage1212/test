import { Room } from "@/types/database";
import { BaseRoomCard } from "./BaseRoomCard";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface CornerOfficeProps {
  room: Room;
  isEditMode?: boolean;
  onNameChange?: (newName: string) => void;
  onAssignUser?: (index: number, userId: string | null) => void;
  onDelete?: () => void;
  onVisit?: (userId: string) => void;
  onLeave?: (userId: string) => void;
}

export function CornerOffice({
  room,
  isEditMode,
  onNameChange,
  onAssignUser,
  onDelete,
  onVisit,
  onLeave,
}: CornerOfficeProps) {
  const { userData: currentUser } = useAuthContext();
  const { toast } = useToast();

  console.log("CornerOffice rendered", currentUser);

  if (!currentUser) return null;

  const isAssignedUser = room.assignedUsers.includes(currentUser.id);
  const isOccupant = room.currentOccupants.includes(currentUser.id);

  const assignedUserId = room.assignedUsers[0];
  const assignedUserPresent =
    assignedUserId && room.currentOccupants.includes(assignedUserId);

  const canVisit =
    !isOccupant &&
    (!assignedUserId ||
      assignedUserPresent ||
      currentUser.id === assignedUserId) &&
    room.currentOccupants.length < room.maxOccupants;

  const handleVisit = async () => {
    try {
      await onVisit?.(currentUser.id);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to visit office",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    try {
      await onLeave?.(currentUser.id);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to leave office",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseRoomCard
      room={room}
      isEditMode={isEditMode}
      isCornerOffice
      onNameChange={onNameChange}
      onAssignUser={onAssignUser}
      onDelete={onDelete}
      onVisit={handleVisit}
      onLeave={handleLeave}
      canVisit={canVisit}
      isOccupant={isOccupant}
      assignedUserPresent={assignedUserPresent}
      maxDisplayAvatars={3}
    />
  );
}
