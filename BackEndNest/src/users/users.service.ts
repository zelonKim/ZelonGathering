import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { email, password, passwordConfirm, nickname } = dto;

    // 1. 비밀번호와 비밀번호 확인 일치 여부 체크 
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    // 2. 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 3. 비밀번호 암호화 (Salt Round: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. DB에 유저 생성 
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
      },
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      message: '회원가입이 완료되었습니다.',
    };
  }

/////////////////////////////////////////////////


  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 올바르지 않습니다.',
      );
    }

    // JWT Payload 구성 및 발급
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    };
  }


  /////////////////////////////////////////////////



  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImg: true,
        mannerTemperature: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  /////////////////////////////////////////////////


  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, nickname: true, profileImg: true },
    });
  }
}
