import { client } from "../client";

export const joinGathering = async (id: string | number) => {
  const { data } = await client.post(`/gatherings/${id}/join`);
  return data;
};