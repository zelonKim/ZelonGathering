import { Category } from "./Category";
import { Day } from "./Day";
import { District } from "./District";
import { Time } from "./Time";

export interface CreateGatheringPayload {
  title: string;
  description: string;
  category: Category 
  maxParticipants: number;
  gatheringPlace: string;
  latitude: number;
  longitude: number;
  district: District 
  gatheringDay: Day[] 
  gatheringTime: Time[] 
}
