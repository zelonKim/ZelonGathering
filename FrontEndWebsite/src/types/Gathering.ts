import { Category } from "./Category";
import { Day } from "./Day";
import { District } from "./District";
import { GatheringStatus } from "./GatheringStatus";
import { Time } from "./Time";

export interface Gathering {
  id: number;
  title: string;
  description: string;
  category: Category;
  maxParticipants: number;
  gatheringPlace: string;
  latitude: number | null;
  longitude: number | null;
  district: District;
  gatheringDay: Day[];
  gatheringTime: Time[];
  status: GatheringStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GatheringWithDistance extends Gathering {
  distanceMetres: number | null;
  distanceStr: string | null;
}
