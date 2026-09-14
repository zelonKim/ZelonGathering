import { client } from "../client";
import type { UserProfile } from "@/types/UserProfile";

export const getMyProfile = async (): Promise<UserProfile> => {
  const { data } = await client.get<UserProfile>("/users/me");
  return data;
};
