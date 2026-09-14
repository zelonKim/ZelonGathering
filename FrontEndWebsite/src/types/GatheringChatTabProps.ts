import { RefObject } from "react";
import { PublicChatMessage } from "./PublicChatMessage";

export interface GatheringChatTabProps {
  chatMessages: PublicChatMessage[];
  myId?: string;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (
    e?: React.KeyboardEvent | React.SubmitEvent<HTMLFormElement>,
  ) => void;
  isChatMessageSendPending: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
}
