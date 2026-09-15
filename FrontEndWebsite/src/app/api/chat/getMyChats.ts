import { client } from "../client";
import type { ChatRoomListItem } from "@/types/ChatRoomListItem";

export const getMyChats = async (): Promise<ChatRoomListItem[]> => {
  const { data } = await client.get<ChatRoomListItem[]>("/users/chats");
  return data;
};
