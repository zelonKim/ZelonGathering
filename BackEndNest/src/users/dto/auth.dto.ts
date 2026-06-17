import { Day, District, GatheringCategory, Mbti, Time } from '@prisma/client';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty({ message: '이메일을 입력해 주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email!: string;

  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  @MinLength(8, { message: '비밀번호는 최소 8자리 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.',
  })
  password!: string;

  @IsNotEmpty({ message: '비밀번호 확인을 입력해 주세요.' })
  passwordConfirm!: string;
}


export class LoginDto {
  @IsNotEmpty({ message: '이메일을 입력해 주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email!: string;

  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  @MinLength(8, { message: '비밀번호는 최소 8자리 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.',
  })
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
