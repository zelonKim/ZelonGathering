import { client } from "../client";

export const deleteGathering = async (id: string) => {
  const { data } = await client.delete(`/gatherings/${id}`);
  return data;
};