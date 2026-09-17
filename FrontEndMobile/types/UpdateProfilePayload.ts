import { Category } from "./Category";
import { District } from "./District";
import { Mbti } from "./MBTI";
import { Day } from "./Day";
import { Time } from "./Time";

export interface UpdateProfilePayload {
  nickname?: string;
  favorite?: string | null;
  hate?: string | null;
  age?: number | null;
  mbti?: Mbti | string | null;
  preferCategory?: Category[] | string[] | null;
  preferDistrict?: District[] | string[] | null;
  preferDay?: Day[] | string[] | null;
  preferTime?: Time[] | string[] | null;
  profileImg?: string | null;
}
