import { serializeParams } from "@/utils/serializeParams";
import { client } from "../client";
import { GatheringWithDistance } from "@/types/Gathering";

export const getGatherings = async (params: {
  types: string[];
  categories: string[];
  clientDay: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await client.get<GatheringWithDistance[]>("gatherings", {
    params,
    paramsSerializer: serializeParams,
  });
  return response.data;
};
