import { client } from "../client";

export const kickParticipant = async (id: string, targetUserId: string) => {
  const { data } = await client.patch(`/gatherings/${id}/participants`, {
    userId: targetUserId,
    status: "REJECTED",
  });
  return data;
};