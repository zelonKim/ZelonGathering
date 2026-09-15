import { ChatMessage } from "@/types/ChatMessage";
import { client } from "../client";

export const getPrivateMessages = async (
  roomId: string,
  limit: number,
): Promise<ChatMessage[]> => {
  const { data } = await client.get<ChatMessage[]>(
    `/chats/private/messages/${roomId}`,
    { params: { limit } },
  );
  return data.reverse();
};
