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
  // DB에서 desc(최신순)로 가져온 경우, 채팅창 출력을 위해 시간순(asc)으로 정렬
  return data.reverse();
};