export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'office' | 'corner-office' | 'team-room' | 'meeting-room';
  assignedUsers: string[]; // Store user IDs instead of full user objects
  currentOccupants: string[]; // Store user IDs
  position: {
    x: number;
    y: number;
  };
  size: {
    w: number;
    h: number;
  };
  maxOccupants: number;
  createdAt: string;
  updatedAt: string;
}