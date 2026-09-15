export interface PrivateChatUser {
  id: string;
  nickname: string;
  profileImg: string | null;
  mannerTemperature: number;
}

export interface PrivateChatMessage {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PrivateChatRoomListItem {
  id: string;
  userAId: string;
  userBId: string;
  userA: PrivateChatUser;
  userB: PrivateChatUser;
  messages: PrivateChatMessage[];
  updatedAt: string;
}
