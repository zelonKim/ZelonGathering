import { Category } from "./Category";
import { Day } from "./Day";
import { District } from "./District";
import { Time } from "./Time";

export interface CreateGatheringPayload {
  title: string | null;
  description: string | null;
  category: Category | null;
  maxParticipants: number | null;
  gatheringPlace: string | null;
  latitude: number | null;
  longitude: number | null;
  district: District | null;
  gatheringDay: Day[] | null;
  gatheringTime: Time[] | null;
}
