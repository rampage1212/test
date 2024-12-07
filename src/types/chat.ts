export interface ChatSpace {
  name: string;
  displayName: string;
  type: 'ROOM' | 'DM';
  spaceType: 'SPACE' | 'DIRECT_MESSAGE';
}

export interface ChatMessage {
  name: string;
  text: string;
  createTime: string;
  sender?: {
    name: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
}