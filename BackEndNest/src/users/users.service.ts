import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // 🚀 R2 스토리지 통신을 위한 SDK 추가
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // 🚀 파일명 난수화(중복 방지) 패키지
import * as path from 'path';

@Injectable()
export class UsersService {
  private s3Client: S3Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // 💡 Cloudflare R2 스펙 설정 자원을 품은 S3 클라이언트 인스턴스 초기화
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  // 🚀 1. 새로 추가된 Cloudflare R2 이미지 단독 업로드 비즈니스 로직
  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    // 파일명 유니크 난수 처리(profile/고유UUID.png)
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `profile/${uuidv4()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype, // 뷰어가 다운로드하지 않고 이미지 렌더를 바로 때리도록 마임타입 지정
      });

      await this.s3Client.send(command);

      // 접근 가능한 HTTPS 이미지 퍼블릭 링크 뱉어내기
      return `${publicUrl}/${uniqueFileName}`;
    } catch (error) {
      console.error('Cloudflare R2 업로드 중 예외 발생:', error);
      throw new InternalServerErrorException(
        '이미지 업로드 중 오류가 발생했습니다.',
      );
    }
  }

  /////////////////////////////////////////////////

  async signup(dto: SignupDto) {
    const { email, password, passwordConfirm } = dto;

    // 비밀번호와 비밀번호 확인 일치 여부 체크
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    // 이메일 중복 체크
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
  /////////////////////////////////////////////////

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

  /////////////////////////////////////////////////

  async getMyNotifications(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('존재하지 않는 회원입니다.');
    }

    // 해당 유저에게 온 알림 테이블 데이터 긁어오기
    return await this.prisma.notification.findMany({
      where: {
        userId, // 내 ID 앞으로 온 알림만 타이트하게 필터링
      },
      orderBy: {
        createdAt: 'desc', // 💡 방금 전 알림이 무조건 화면 최상단에 꽂히도록 내림차순 정렬 슛!
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        linkId: true,
        createdAt: true,
        matchRate: true,
      },
    });
  }

  /////////////////////////////////////////////////

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    const noti = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!noti) {
      throw new NotFoundException('해당 알림을 찾을 수 없습니다.');
    }

    // 🌟 수정된 부분: 객체 전체가 아닌 `where` 조건을 넘겨줍니다.
    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true };
  }

  /////////////////////////////////////////////////

  async getMyChats(userId: string) {
    // 1. 유저가 참여하고 있는 소모임(Gathering) 목록 조회
    const joinedGatherings = await this.prisma.gathering.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
            status: 'ACCEPTED', // 승인된 정식 멤버인 방만 골라내기
          },
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        // 2. 해당 소모임방의 가장 최신 메시지 1개 가져오기
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

    // 3. 프론트엔드(ChatsScreen) 요약 카드 스펙에 맞게 가공(Mapping)해서 리턴
    return joinedGatherings.map((gathering) => {
      const lastChat = gathering.chatMessages[0]; // 가장 최신 메시지 객체 (없을 수 있으므로 옵셔널 체이닝 처리)

      return {
        id: gathering.id,
        title: gathering.title,
        category: gathering.category,
        lastMessage: lastChat
          ? lastChat.message
          : '아직 주고받은 대화가 없습니다.',
        lastMessageTime: lastChat
          ? this.formatChatTime(lastChat.createdAt)
          : '',
        unreadCount: 0, // 💡 안 읽은 개수 기능은 차후 테이블/로그 설계 후 확장 가능하도록 세팅
      };
    });
  }

  /**
   * 📅 날짜 객체를 프론트 뷰에 맞게 "오후 2:30" 또는 "어제" 형태로 포맷팅하는 헬퍼 메서드
   */
  private formatChatTime(date: Date): string {
    const now = new Date();
    const chatDate = new Date(date);

    // 같은 날이면 시간 표시
    if (now.toDateString() === chatDate.toDateString()) {
      return chatDate.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // 하루 전이면 '어제'
    const diffTime = now.getTime() - chatDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '어제';

    // 그 외에는 월/일 표시
    return `${chatDate.getMonth() + 1}월 ${chatDate.getDate()}일`;
  }
}
