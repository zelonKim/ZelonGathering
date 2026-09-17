import { GatheringDetail } from "@/types/GatheringDetail";
import { client } from "../client";

export const getGatheringDetail = async (id: string) => {
  const { data } = await client.get<GatheringDetail>(`/gatherings/${id}`);
  return data;
};
