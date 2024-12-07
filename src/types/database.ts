import { Timestamp } from 'firebase/firestore';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  isAdmin: boolean;
  homeOfficeId?: string;
  currentOfficeId?: string | null;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Room {
  id?: string;
  name: string;
  type: 'office' | 'corner-office' | 'team-room' | 'meeting-room';
  assignedUsers: string[];
  currentOccupants: string[];
  position: {
    x: number;
    y: number;
  };
  size: {
    w: number;
    h: number;
  };
  maxOccupants: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'room' | 'group';
  members: string[];
  lastMessage: ChatMessage | null;
  unreadCounts: { [userId: string]: number };
  lastReadTimestamps: { [userId: string]: Timestamp };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  attachments: string[];
  readBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedAt?: Timestamp;
}

export interface RoomUpdate {
  name?: string;
  assignedUsers?: string[];
  currentOccupants?: string[];
  position?: {
    x: number;
    y: number;
  };
  size?: {
    w: number;
    h: number;
  };
  maxOccupants?: number;
  updatedAt: Timestamp;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  department?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  isAdmin?: boolean;
  homeOfficeId?: string | null;
  currentOfficeId?: string | null;
  lastActive?: Timestamp;
  updatedAt: Timestamp;
}