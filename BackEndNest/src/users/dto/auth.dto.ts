import { Day, District, GatheringCategory, Mbti, Time } from '@prisma/client';

export class SignupDto {
  email!: string;
  password!: string;
  passwordConfirm!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class UpdateProfileDto {
  nickname?: string;
  favorite?: string;
  hate?: string;
  age?: number;
  mbti?: Mbti;
  preferCategory?: GatheringCategory[];
  preferDistrict?: District[];
  preferDay?: Day[];
  preferTime?: Time[];
  profileImg?: string;
}
