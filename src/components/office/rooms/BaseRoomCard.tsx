import { Room } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "../UserAvatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { UserAssignment } from "./UserAssignment";
import { Button } from "@/components/ui/button";
import { X, DoorOpen, LogOut, MessageSquare, Users } from "lucide-react";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoogleChat } from "../../chat/GoogleChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BaseRoomCardProps {
  room: Room;
  isEditMode?: boolean;
  isCornerOffice?: boolean;
  icon?: React.ReactNode;
  onNameChange?: (newName: string) => void;
  onAssignUser?: (index: number, userId: string | null) => void;
  onDelete?: () => void;
  onVisit?: () => void;
  onLeave?: () => void;
  canVisit?: boolean;
  isOccupant?: boolean;
  assignedUserPresent?: boolean;
  maxDisplayAvatars?: number;
}

export function BaseRoomCard({
  room,
  isEditMode,
  isCornerOffice,
  icon,
  onNameChange,
  onAssignUser,
  onDelete,
  onVisit,
  onLeave,
  canVisit,
  isOccupant,
  assignedUserPresent,
  maxDisplayAvatars = 4,
}: BaseRoomCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(room.name);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { users } = useUsers();
  const { userData } = useAuthContext();
  const isOccupied = room.currentOccupants.length > 0;
  const isMeetingRoom = room.type === "meeting-room";

  const handleNameSubmit = () => {
    if (name.trim() !== "") {
      setIsEditing(false);
      onNameChange?.(name.trim());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setName(room.name);
    }
  };

  const renderAvatars = () => {
    const occupantUsers = room.currentOccupants
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean);

    const assignedUsers =
      !isMeetingRoom && room.assignedUsers
        ? room.assignedUsers
            .map((id) => users.find((u) => u.id === id))
            .filter(Boolean)
        : [];

    const displayCount = Math.min(maxDisplayAvatars, room.maxOccupants);
    const additionalUsers = room.currentOccupants.length - displayCount;

    return (
      <div className="flex items-center gap-2 pl-4">
        {/* Show assignment button only for the first slot in office/corner office */}
        {isEditMode &&
          (room.type === "office" || room.type === "corner-office") && (
            <UserAssignment
              index={0}
              assignedUserId={assignedUsers[0]?.id}
              onAssign={(userId) => onAssignUser?.(0, userId)}
            />
          )}

        {/* Display avatars up to maxDisplayAvatars */}
        {Array.from({ length: displayCount }).map((_, index) => {
          const occupant = occupantUsers[index];
          const isAssignmentSlot =
            index === 0 &&
            (room.type === "office" || room.type === "corner-office");

          if (occupant && !isEditMode) {
            return (
              <UserAvatar
                key={`occupant-${occupant.id}`}
                user={occupant}
                className="h-16 w-16"
              />
            );
          }

          if (!isEditMode && !isAssignmentSlot) {
            return (
              <div
                key={`empty-${index}`}
                className="h-16 w-16 rounded-full bg-muted/20"
              />
            );
          }

          return null;
        })}

        {/* Show additional users count if any */}
        {additionalUsers > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted/30">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>+{additionalUsers}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {additionalUsers} more {additionalUsers === 1 ? "user" : "users"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderButtons = () => {
    if (isEditMode) return null;

    return (
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {room.assignedUsers.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat with room members</TooltipContent>
          </Tooltip>
        )}

        {isOccupant ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onLeave}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave Office</TooltipContent>
          </Tooltip>
        ) : canVisit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onVisit}
              >
                <DoorOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visit Office</TooltipContent>
          </Tooltip>
        ) : room.assignedUsers.length > 0 && !assignedUserPresent ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <DoorOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Assigned user must be present to visit
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <Card
        className={cn(
          "h-full w-full relative group border-muted",
          "bg-[#1D1C20] backdrop-blur-sm",
          "shadow-lg hover:shadow-xl transition-all duration-200",
          isEditMode && "cursor-move border-dashed"
        )}
      >
        {isEditMode && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {icon}
        {renderButtons()}
        <CardContent className="flex h-full flex-col p-2">
          <div className="h-6 flex items-center">
            {isEditMode && isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="h-5 text-xs px-1 bg-background/50"
                autoFocus
                maxLength={30}
              />
            ) : (
              <h3
                className={cn(
                  "truncate text-xs font-medium px-1",
                  isOccupied ? "text-primary" : "text-muted-foreground",
                  isEditMode &&
                    "cursor-pointer hover:text-primary hover:bg-muted/30 rounded"
                )}
                onClick={() => isEditMode && setIsEditing(true)}
                title={room.name}
              >
                {room.name}
              </h3>
            )}
          </div>

          <div className="flex-1 flex items-center">{renderAvatars()}</div>
        </CardContent>
      </Card>

      {isChatOpen && (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle>Chat - {room.name}</DialogTitle>
            </DialogHeader>
            <GoogleChat roomId={room.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
