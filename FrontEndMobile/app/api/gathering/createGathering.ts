import { CreateGatheringPayload } from "@/types/CreateGatheringPayload";
import { client } from "../client";

export const createGathering = async (newGathering: CreateGatheringPayload) => {
  const { data } = await client.post("/gatherings", newGathering);
  return data;
};

