import { client } from "../client";

export interface PrivateChatRoom {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  updatedAt: string;
}

export const openPrivateChatRoom = async (
  partnerUserId: string
): Promise<PrivateChatRoom> => {
  const { data } = await client.post<PrivateChatRoom>(
    `/chats/private/room/${partnerUserId}`
  );
  return data;
};