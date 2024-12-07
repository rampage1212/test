import { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Room } from "@/types/database";
import { OfficeRoom } from "./rooms/OfficeRoom";
import { CornerOffice } from "./rooms/CornerOffice";
import { TeamRoom } from "./rooms/TeamRoom";
import { MeetingRoom } from "./rooms/MeetingRoom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BottomBar } from "./BottomBar";
import { useUsers } from "@/lib/hooks/useUsers";
import { useRooms } from "@/lib/hooks/useRooms";
import { useToast } from "@/components/ui/use-toast";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  assignHomeOffice,
  visitOffice,
  leaveOffice,
} from "@/lib/services/roomService";
import { Timestamp } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ResponsiveGridLayout = WidthProvider(Responsive);

const GRID_COLS = 180;
const GRID_ROWS = 100;
const MARGIN = 2;

const getRoomDefaults = (type: Room["type"]) => {
  const defaults = {
    office: { w: 16, h: 10, maxOccupants: 5 },
    "corner-office": { w: 28, h: 10, maxOccupants: 5 },
    "team-room": { w: 36, h: 10, maxOccupants: 5 },
    "meeting-room": { w: 36, h: 10, maxOccupants: 5 },
  };
  return defaults[type];
};

interface FloorPlanProps {
  onEditModeChange?: (isEditMode: boolean) => void;
}

interface RoomWithId extends Room {
  id: string;
}

export function FloorPlan({ onEditModeChange }: FloorPlanProps) {
  const { users } = useUsers();
  const { rooms, loading, error } = useRooms();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<Layout[]>([]);
  const prevLayoutRef = useRef<Layout[]>([]);
  const isDraggingRef = useRef(false);
  const currentUserRef = useRef(users[0]); // For demo purposes, use first user

  // Update currentUserRef when users change
  useEffect(() => {
    currentUserRef.current = users[0];
  }, [users]);

  // Initialize and update layout when rooms change
  useEffect(() => {
    if (!loading && rooms.length > 0) {
      const newLayout = rooms.map((room) => ({
        i: room.id,
        x: room.position.x,
        y: room.position.y,
        w: room.size.w,
        h: room.size.h,
        static: !isEditMode,
      }));

      setLayout(newLayout);
      prevLayoutRef.current = newLayout;
    }
  }, [rooms, loading, isEditMode]);

  useEffect(() => {
    onEditModeChange?.(isEditMode);
  }, [isEditMode, onEditModeChange]);

  const checkOverlap = (item1: Layout, item2: Layout): boolean => {
    const margin = MARGIN;
    return (
      item1.x < item2.x + item2.w + margin &&
      item1.x + item1.w + margin > item2.x &&
      item1.y < item2.y + item2.h + margin &&
      item1.y + item1.h + margin > item2.y
    );
  };

  const isWithinBounds = (item: Layout): boolean => {
    return (
      item.x >= 0 &&
      item.y >= 0 &&
      item.x + item.w <= GRID_COLS &&
      item.y + item.h <= GRID_ROWS
    );
  };

  const findEmptySpace = (
    width: number,
    height: number
  ): { x: number; y: number } | null => {
    const grid = Array(GRID_ROWS)
      .fill(0)
      .map(() => Array(GRID_COLS).fill(false));

    layout.forEach((item) => {
      for (
        let y = Math.max(0, item.y - MARGIN);
        y < Math.min(GRID_ROWS, item.y + item.h + MARGIN);
        y++
      ) {
        for (
          let x = Math.max(0, item.x - MARGIN);
          x < Math.min(GRID_COLS, item.x + item.w + MARGIN);
          x++
        ) {
          grid[y][x] = true;
        }
      }
    });

    for (let y = 0; y < GRID_ROWS - height; y++) {
      for (let x = 0; x < GRID_COLS - width; x++) {
        let canFit = true;

        for (let dy = 0; dy < height + MARGIN && canFit; dy++) {
          for (let dx = 0; dx < width + MARGIN && canFit; dx++) {
            if (grid[y + dy]?.[x + dx]) {
              canFit = false;
            }
          }
        }

        if (canFit) {
          return { x, y };
        }
      }
    }

    return null;
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!isEditMode || !isDraggingRef.current) return;

    const hasOverlap = newLayout.some((item1) => {
      return newLayout.some((item2) => {
        if (item1.i === item2.i) return false;
        return checkOverlap(item1, item2);
      });
    });

    const outOfBounds = newLayout.some((item) => !isWithinBounds(item));

    if (outOfBounds || hasOverlap) {
      setLayout(prevLayoutRef.current);
      return;
    }

    setLayout(newLayout);
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    prevLayoutRef.current = layout;
  };

  const handleDragStop = async (newLayout: Layout[]) => {
    isDraggingRef.current = false;

    try {
      const updates = rooms
        .map((room) => {
          const layoutItem = newLayout.find((l) => l.i === room.id);
          if (!layoutItem) return null;

          return updateRoom(room.id, {
            position: { x: layoutItem.x, y: layoutItem.y },
            size: { w: layoutItem.w, h: layoutItem.h },
            updatedAt: Timestamp.now(),
          });
        })
        .filter(Boolean);

      await Promise.all(updates);
    } catch (error) {
      setLayout(prevLayoutRef.current);
      toast({
        title: "Error",
        description: "Failed to update room positions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addRoom = async (type: Room["type"]) => {
    try {
      const defaults = getRoomDefaults(type);
      const position = findEmptySpace(defaults.w, defaults.h);

      if (!position) {
        toast({
          title: "No space available",
          description:
            "Unable to add a new room. Please make space on the floor plan.",
          variant: "destructive",
        });
        return;
      }

      const tempId = `temp-${Date.now()}`;

      const roomData = {
        name: `New ${type}`,
        type,
        position,
        size: { w: defaults.w, h: defaults.h },
        currentOccupants: [],
        assignedUsers: [],
        maxOccupants: defaults.maxOccupants,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const newLayoutItem = {
        i: tempId,
        x: position.x,
        y: position.y,
        w: defaults.w,
        h: defaults.h,
        static: !isEditMode,
      };

      setLayout((prev) => [...prev, newLayoutItem]);

      const roomId = await createRoom(roomData);

      setLayout((prev) =>
        prev.map((item) => (item.i === tempId ? { ...item, i: roomId } : item))
      );

      toast({
        title: "Room created",
        description: `New ${type} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignUser = async (
    roomId: string,
    seatIndex: number,
    userId: string | null
  ) => {
    if (!userId) return;

    try {
      await assignHomeOffice(userId, roomId);
      toast({
        title: "Home office assigned",
        description: "User has been assigned to their new home office.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign home office. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVisitOffice = async (roomId: string, userId: string) => {
    try {
      await visitOffice(userId, roomId);
      toast({
        title: "Office visited",
        description: "You are now visiting this office.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Cannot visit office",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleLeaveOffice = async (roomId: string, userId: string) => {
    try {
      await leaveOffice(userId);
      toast({
        title: "Left office",
        description: "You have left the office.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave office. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoomNameChange = async (roomId: string, newName: string) => {
    try {
      await updateRoom(roomId, {
        name: newName,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    if (room.currentOccupants.length > 0) {
      toast({
        title: "Cannot delete room",
        description: "Please ensure the room is empty before deleting.",
        variant: "destructive",
      });
      return;
    }

    setRoomToDelete(roomId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoom(roomToDelete);

      setRooms((prevRooms) =>
        prevRooms.filter((room) => room.id !== roomToDelete)
      );
      setLayout((prevLayout) =>
        prevLayout.filter((item) => item.i !== roomToDelete)
      );

      toast({
        title: "Room deleted",
        description: "The room has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const renderRoom = (room: RoomWithId) => {
    const props = {
      room,
      isEditMode,
      onNameChange: (newName: string) => handleRoomNameChange(room.id, newName),
      onAssignUser: (index: number, userId: string | null) =>
        handleAssignUser(room.id, index, userId),
      onVisit: (userId: string) => handleVisitOffice(room.id, userId),
      onLeave: (userId: string) => handleLeaveOffice(room.id, userId),
      onDelete: () => handleDeleteRoom(room.id),
    };
    switch (room.type) {
      case "office":
        return <OfficeRoom {...props} />;
      case "corner-office":
        return <CornerOffice {...props} />;
      case "team-room":
        return <TeamRoom {...props} />;
      case "meeting-room":
        return <MeetingRoom {...props} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-lg text-muted-foreground">
          Loading floor plan...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {isEditMode && (
          <div className="flex gap-2">
            <Button onClick={() => addRoom("office")} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Office
            </Button>
            <Button onClick={() => addRoom("corner-office")} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Corner Office
            </Button>
            <Button onClick={() => addRoom("team-room")} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Team Room
            </Button>
            <Button onClick={() => addRoom("meeting-room")} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Meeting Room
            </Button>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: GRID_COLS, md: 120, sm: 80, xs: 40, xxs: 20 }}
          rowHeight={10}
          isDraggable={isEditMode}
          isResizable={false}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          margin={[MARGIN, MARGIN]}
          containerPadding={[MARGIN, MARGIN]}
          preventCollision={true}
          compactType={null}
        >
          {rooms.map((room) => (
            <div key={room.id}>{renderRoom(room)}</div>
          ))}
        </ResponsiveGridLayout>
      </div>

      <BottomBar
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
