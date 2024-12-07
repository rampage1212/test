import { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Room } from '@/types/database';
import { UserWithId } from '@/lib/hooks/useUsers';
import { OfficeRoom } from './rooms/OfficeRoom';
import { CornerOffice } from './rooms/CornerOffice';
import { TeamRoom } from './rooms/TeamRoom';
import { MeetingRoom } from './rooms/MeetingRoom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BottomBar } from './BottomBar';
import { useUsers } from '@/lib/hooks/useUsers';
import { useToast } from '@/components/ui/use-toast';
import { createRoom, deleteRoom } from '@/lib/services/roomService';
import { Timestamp } from 'firebase/firestore';
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

// Room dimension constants
const ROOM_DIMENSIONS = {
  'office': { w: 16, h: 10, maxOccupants: 1 },
  'corner-office': { w: 24, h: 10, maxOccupants: 2 },
  'team-room': { w: 40, h: 10, maxOccupants: 3 },
  'meeting-room': { w: 40, h: 10, maxOccupants: 3 }
} as const;

interface FloorPlanProps {
  onEditModeChange?: (isEditMode: boolean) => void;
}

interface RoomWithId extends Room {
  id: string;
}

export function FloorPlan({ onEditModeChange }: FloorPlanProps) {
  const { users } = useUsers();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomWithId[]>(() => {
    if (users.length === 0) return [];
    
    const now = Timestamp.now();
    
    return [
      {
        id: 'growth-ops',
        name: 'Growth Ops',
        type: 'office',
        assignedUsers: [users[0].id],
        currentOccupants: [users[0].id],
        position: { x: 0, y: 0 },
        size: ROOM_DIMENSIONS['office'],
        maxOccupants: ROOM_DIMENSIONS['office'].maxOccupants,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'growth-training',
        name: 'Growth Training',
        type: 'corner-office',
        assignedUsers: users.length > 1 ? [users[1].id] : [],
        currentOccupants: users.length > 1 ? [users[1].id] : [],
        position: { x: 20, y: 0 },
        size: ROOM_DIMENSIONS['corner-office'],
        maxOccupants: ROOM_DIMENSIONS['corner-office'].maxOccupants,
        createdAt: now,
        updatedAt: now
      }
    ];
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState(() => 
    rooms.map(room => ({
      i: room.id,
      x: room.position.x,
      y: room.position.y,
      w: room.size.w,
      h: room.size.h,
      minW: ROOM_DIMENSIONS[room.type].w,
      minH: ROOM_DIMENSIONS[room.type].h
    }))
  );

  useEffect(() => {
    onEditModeChange?.(isEditMode);
  }, [isEditMode, onEditModeChange]);

  const findEmptySpace = (width: number): { x: number; y: number } => {
    const occupiedSpaces = new Set<string>();
    
    layout.forEach(item => {
      for (let x = item.x; x < item.x + item.w + MARGIN; x++) {
        for (let y = item.y; y < item.y + item.h + MARGIN; y++) {
          occupiedSpaces.add(`${x},${y}`);
        }
      }
    });

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x <= GRID_COLS - width; x++) {
        let canFit = true;
        
        for (let dx = 0; dx < width + MARGIN; dx++) {
          if (occupiedSpaces.has(`${x + dx},${y}`)) {
            canFit = false;
            break;
          }
        }

        if (canFit) {
          return { x, y };
        }
      }
    }

    const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
    return { x: 0, y: maxY };
  };

  const addRoom = async (type: Room['type']) => {
    try {
      const dimensions = ROOM_DIMENSIONS[type];
      const position = findEmptySpace(dimensions.w);
      
      const roomData = {
        name: `New ${type}`,
        type,
        position,
        size: dimensions,
        currentOccupants: [],
        assignedUsers: [],
        maxOccupants: dimensions.maxOccupants,
      };

      const roomId = await createRoom(roomData);
      
      const newRoom: RoomWithId = {
        ...roomData,
        id: roomId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      setRooms(prev => [...prev, newRoom]);
      setLayout(prev => [...prev, {
        i: roomId,
        x: position.x,
        y: position.y,
        w: dimensions.w,
        h: dimensions.h,
        minW: dimensions.w,
        minH: dimensions.h
      }]);

      toast({
        title: "Room created",
        description: `New ${type} has been created successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAssignUser = (roomId: string, seatIndex: number, userId: string | null) => {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id !== roomId || room.type === 'meeting-room') return room;

        const assignedUsers = [...room.assignedUsers];
        if (userId === null) {
          assignedUsers[seatIndex] = undefined;
        } else {
          assignedUsers[seatIndex] = userId;
        }

        const filteredUsers = assignedUsers.filter((id): id is string => id !== undefined);

        return {
          ...room,
          assignedUsers: filteredUsers,
          currentOccupants: filteredUsers,
          updatedAt: Timestamp.now()
        };
      })
    );
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!isEditMode) return;

    const hasOverlap = newLayout.some((item1) => {
      return newLayout.some((item2) => {
        if (item1.i === item2.i) return false;

        const horizontalOverlap = 
          item1.x < (item2.x + item2.w + MARGIN) && 
          (item1.x + item1.w + MARGIN) > item2.x;
        
        const verticalOverlap = 
          item1.y < (item2.y + item2.h + MARGIN) && 
          (item1.y + item1.h + MARGIN) > item2.y;

        return horizontalOverlap && verticalOverlap;
      });
    });

    if (!hasOverlap) {
      setLayout(newLayout);
      setRooms(prevRooms =>
        prevRooms.map(room => {
          const layoutItem = newLayout.find(l => l.i === room.id);
          if (!layoutItem) return room;

          return {
            ...room,
            position: { x: layoutItem.x, y: layoutItem.y },
            size: { w: layoutItem.w, h: layoutItem.h },
            updatedAt: Timestamp.now()
          };
        })
      );
    }
  };

  const handleRoomNameChange = (roomId: string, newName: string) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId 
          ? { ...room, name: newName, updatedAt: Timestamp.now() } 
          : room
      )
    );
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    if (room.currentOccupants.length > 0) {
      toast({
        title: "Cannot delete room",
        description: "Please ensure the room is empty before deleting.",
        variant: "destructive"
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
      
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomToDelete));
      setLayout(prevLayout => prevLayout.filter(item => item.i !== roomToDelete));
      
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
      onDelete: () => handleDeleteRoom(room.id)
    };
    
    switch (room.type) {
      case 'office':
        return <OfficeRoom {...props} />;
      case 'corner-office':
        return <CornerOffice {...props} />;
      case 'team-room':
        return <TeamRoom {...props} />;
      case 'meeting-room':
        return <MeetingRoom {...props} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {isEditMode && (
          <div className="flex gap-2">
            <Button onClick={() => addRoom('office')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Office
            </Button>
            <Button onClick={() => addRoom('corner-office')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Corner Office
            </Button>
            <Button onClick={() => addRoom('team-room')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Team Room
            </Button>
            <Button onClick={() => addRoom('meeting-room')} size="sm">
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
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
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
              Are you sure you want to delete this room? This action cannot be undone.
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