export interface ChatSender {
  id: string;
  nickname: string;
  profileImg: string | null;
}

export interface PublicChatMessage {
  id: string;
  gatheringId: string;
  senderId: string;
  message: string;
  createdAt: Date | string; 
  sender: ChatSender;
}