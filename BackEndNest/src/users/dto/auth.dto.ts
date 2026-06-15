export class SignupDto {
  email!: string;
  password!: string;
  passwordConfirm!: string;
  nickname!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class UpdateProfileDto {
  nickname?: string;
  profileImg?: string;
}
