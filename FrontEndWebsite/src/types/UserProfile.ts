import { Day } from "./Day";
import { District } from "./District";
import { Category } from "./Category";
import { Mbti } from "./MBTI";
import { Time } from "./Time";

export interface JoinedGatheringItem {
  id: string;
  status: string;
  gathering: {
    id: string;
    title: string;
    gatheringPlace: string;
    category: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  profileImg: string | null;
  mannerTemperature: number;
  nickname: string;
  age: number;
  favorite: string;
  hate: string;
  mbti: Mbti;
  preferCategory: Category[];
  preferDistrict: District[];
  preferDay: Day[];
  preferTime: Time[];
  joinedGatherings: JoinedGatheringItem[];
}
