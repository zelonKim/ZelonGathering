import { client } from "../client";

export async function getMyPrivateChats() {
  const response = await client.get("/chats/private/rooms"); 
  return response.data;
}
