import { client } from "../client";

export const leaveGathering = async (id: string) => {
  const { data } = await client.delete(`/gatherings/${id}/leave`);
  return data;
};
