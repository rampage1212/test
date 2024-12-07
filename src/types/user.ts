import { Timestamp } from 'firebase/firestore';

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  isAdmin: boolean;
  homeOfficeId?: string;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}