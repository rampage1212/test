export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
}

export interface Room {
  id: string;
  name: string;
  type: 'office' | 'team-room' | 'meeting-room';
  assignedUsers: User[];
  currentOccupants: User[];
  position: {
    x: number;
    y: number;
  };
  size: {
    w: number;
    h: number;
  };
}

export interface OfficeRoom extends Room {
  type: 'office';
}

export interface TeamRoom extends Room {
  type: 'team-room';
}

export interface MeetingRoom extends Room {
  type: 'meeting-room';
  meetingUrl?: string;
}