import { ChatMessage } from "./ChatMessage";
import { ChatUserProfile } from "./ChatUserProfile";

export interface PrivateChatRoomDetail {
  id: string;
  userAId: string;
  userBId: string;
  userA: ChatUserProfile;
  userB: ChatUserProfile;
  messages: ChatMessage[];
}
