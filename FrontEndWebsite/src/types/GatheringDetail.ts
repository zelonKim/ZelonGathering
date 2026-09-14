import { Day } from "./Day";
import { ParticipantStatus } from "./ParticipantStatus";
import { Time } from "./Time";

export interface GatheringParticipantUser {
  id: string;
  nickname: string;
  profileImg: string | null;
  mannerTemperature: number;
}

export interface GatheringParticipant {
  id: string;
  gatheringId: string;
  userId: string;
  status?: ParticipantStatus;
  user: GatheringParticipantUser;
}

export interface GatheringDetail {
  id: string;
  hostId?: string;
  title: string;
  description: string;
  category: string;
  district: string;
  gatheringPlace: string;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
  gatheringDay: Day;
  gatheringTime: Time;
  host: GatheringParticipantUser;
  participants: GatheringParticipant[];
}
