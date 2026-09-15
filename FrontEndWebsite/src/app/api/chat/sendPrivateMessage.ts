import { ChatMessage } from "@/types/ChatMessage";
import { client } from "../client";

export const sendPrivateMessage = async (
  roomId: string,
  message: string,
): Promise<ChatMessage> => {
  const { data } = await client.post<ChatMessage>(
    `/chats/private/message/${roomId}`,
    { message },
  );
  return data;
};
