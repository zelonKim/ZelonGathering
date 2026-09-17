import { client } from "../client";

export const sendChatMessage = async (id: string | number, message: string) => {
  const { data } = await client.post(`/chats/public/${id}`, { message });
  return data;
};