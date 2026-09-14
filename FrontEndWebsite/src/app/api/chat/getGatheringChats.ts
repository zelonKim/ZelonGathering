import { client } from "../client";

export const getGatheringChats = async (id: string) => {
  const { data } = await client.get(`/chats/public/${id}`);
  return data;
};