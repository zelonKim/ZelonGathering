export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    nickname: string;
    profileImg?: string;
  };
}
