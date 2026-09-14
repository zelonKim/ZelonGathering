import { client } from "../client";
import type { UpdateProfilePayload } from "@/types/UpdateProfilePayload";

export const updateProfile = async (
  payload: UpdateProfilePayload,
)=> {
  const { data } = await client.patch("/users/profile", payload);
  return data;
};
