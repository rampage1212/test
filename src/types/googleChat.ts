export interface GoogleChatSpace {
  name: string;
  displayName: string;
  type: 'ROOM' | 'DM';
  spaceType?: string;
  spaceThreadingState?: string;
  singleUserBotDm?: boolean;
  threaded?: boolean;
}

export interface GoogleChatMessage {
  name: string;
  sender: {
    name: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
    type?: string;
    domainId?: string;
  };
  text: string;
  space: {
    name: string;
    type: string;
  };
  createTime: string;
  thread?: {
    name: string;
  };
}