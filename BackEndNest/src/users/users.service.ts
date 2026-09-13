import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile';
import type { Express } from 'express';
import 'multer';
import { formatChatTime } from '../utils/formatChatTime';
import { S3Service } from '../services/S3Service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly s3Service: S3Service,
  ) {}

  // 1. 회원가입
  async signup(dto: SignupDto) {
    const { email, password, passwordConfirm } = dto;

    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const randomNickname = `회원_${Math.random().toString(36).substring(2, 10)}`;

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: randomNickname,
      },
    });

    return {
      id: user.id,
      email: user.email,
      message: '회원가입이 완료되었습니다.',
    };
  }

  ////////////////////////////////////////////////////////////////////////////

  // 2. 로그인
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

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    };
  }

  ////////////////////////////////////////////////////////////////////////////

  // 3. 나의 프로필 조회
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profileImg: true,
        mannerTemperature: true,
        nickname: true,
        age: true,
        mbti: true,
        favorite: true,
        hate: true,
        preferCategory: true,
        preferDistrict: true,
        preferDay: true,
        preferTime: true,
        joinedGatherings: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            id: true,
            status: true,
            gathering: {
              select: {
                id: true,
                title: true,
                gatheringPlace: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  ////////////////////////////////////////////////////////////////////////////

  // 4. 프로필 정보 수정
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        nickname: true,
        favorite: true,
        hate: true,
        age: true,
        mbti: true,
        preferCategory: true,
        preferDistrict: true,
        preferDay: true,
        preferTime: true,
        profileImg: true,
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////////

  // 5. 프로필 이미지 업로드
  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    return this.s3Service.uploadFile(file, 'profile');
  }
  ////////////////////////////////////////////////////////////////////////////

  // 6. 나의 매칭 알림 조회
  async getMyNotifications(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('존재하지 않는 회원입니다.');
    }

    return await this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        message: true,
        linkId: true,
        createdAt: true,
        matchRate: true,
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////////

  // 7. 매칭 알림 삭제
  async deleteNotification(id: string) {
    const noti = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!noti) {
      throw new NotFoundException('해당 알림을 찾을 수 없습니다.');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true };
  }

  ////////////////////////////////////////////////////////////////////////////

  // 8. 나의 채팅방 조회
  async getMyChats(userId: string) {
    const joinedGatherings = await this.prisma.gathering.findMany({
      where: {
        participants: {
          some: {
            userId,
            status: 'ACCEPTED',
          },
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        chatMessages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });

    return joinedGatherings.map((gathering) => {
      const lastChat = gathering.chatMessages[0];

      return {
        id: gathering.id,
        title: gathering.title,
        category: gathering.category,
        lastMessage: lastChat
          ? lastChat.message
          : '아직 주고받은 대화가 없습니다.',
        lastMessageTime: lastChat ? formatChatTime(lastChat.createdAt) : '',
        unreadCount: 0,
      };
    });
  }
}
