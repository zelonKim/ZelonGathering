import { RefObject } from "react";
import { ScrollView } from "react-native";
import { PublicChatMessage } from "./PublicChatMessage";

export interface GatheringChatTabProps {
  chatMessages: PublicChatMessage[];
  myId?: string;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: () => void;
  isChatMessageSendPending: boolean;
  chatEndRef: RefObject<ScrollView | null>;
}
