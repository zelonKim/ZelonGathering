import { client } from "@/app/api/client";
import { UserProfile } from "@/types/UserProfile";

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data } = await client.get(`/users/${userId}`);
  return data;
};
