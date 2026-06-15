import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendChatMessagesDto } from './dto/send-chat-messages.dto';
import { GetChatMessagesDto } from './dto/get-chat-messages.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 소모임방 단체 메시지 저장
  async savePublicMessage(
    gatheringId: string,
    senderId: string,
    dto: SendChatMessagesDto,
  ) {
    const participant = await this.prisma.gatheringParticipant.findUnique({
      where: {
        gatheringId_userId: { gatheringId, userId: senderId },
      },
    });

    if (!participant || participant.status !== 'ACCEPTED') {
      throw new ForbiddenException('해당 소모임의 승인된 멤버가 아닙니다.');
    }

    return await this.prisma.publicChat.create({
      data: {
        gatheringId,
        senderId,
        message: dto.message,
      },
      include: {
        sender: { select: { id: true, nickname: true, profileImg: true } },
      },
    });
  }

  ///////////////////////////////////////

  // 2. 소모임방 단체 채팅 과거 내역 조회
  async getPublicMessages(gatheringId: string, dto: GetChatMessagesDto) {
    return await this.prisma.publicChat.findMany({
      where: { gatheringId },
      take: dto.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, nickname: true, profileImg: true } },
      },
    });
  }

  ///////////////////////////////////////

  // 3. 1:1 채팅방 개설 및 가져오기
  async getOrCreatePrivateChatRoom(myId: string, partnerUserId: string) {
    if (myId === partnerUserId) {
      throw new ForbiddenException(
        '자기 자신과는 채팅방을 개설할 수 없습니다.',
      );
    }

    const [userAId, userBId] = [myId, partnerUserId].sort();

    const existingRoom = await this.prisma.privateChatRoom.findUnique({
      where: {
        userAId_userBId: { userAId, userBId },
      },
    });

    if (existingRoom) return existingRoom;

    return await this.prisma.privateChatRoom.create({
      data: { userAId, userBId },
    });
  }

  ///////////////////////////////////////

  // 4. 내가 참여 중인 모든 1:1 채팅방 리스트 가져오기
  async getMyPrivateChatRooms(myId: string) {
    return await this.prisma.privateChatRoom.findMany({
      where: {
        OR: [{ userAId: myId }, { userBId: myId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        userA: {
          select: {
            id: true,
            nickname: true,
            profileImg: true,
            mannerTemperature: true,
          },
        },
        userB: {
          select: {
            id: true,
            nickname: true,
            profileImg: true,
            mannerTemperature: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  ///////////////////////////////////////

  // 5. 특정 1:1 채팅방에 DM 전송 및 방 타임스탬프 업데이트 (트랜잭션)
  // 5. 특정 1:1 채팅방에 DM 전송 및 방 타임스탬프 업데이트
  async savePrivateMessage(
    roomId: string,
    senderId: string,
    dto: SendChatMessagesDto,
  ) {
    const room = await this.prisma.privateChatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('존재하지 않는 채팅방입니다.');

    if (room.userAId !== senderId && room.userBId !== senderId) {
      throw new ForbiddenException('본인이 속한 채팅방이 아닙니다.');
    }

    // 👑 제네릭 자리를 <any>로 바꿔주어 최종 리턴될 message 객체 타입과 맞춰줍니다!
    return await this.prisma.$transaction<any>(async (tx) => {
      const message = await tx.privateChat.create({
        data: {
          roomId,
          senderId,
          message: dto.message,
        },
        include: {
          sender: { select: { id: true, nickname: true, profileImg: true } },
        },
      });

      // 방 목록 최신화를 위해 updatedAt 타임스탬프 스냅샷 찍기
      await tx.privateChatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      });

      // 💡 여기서 배열이 아니라 message 단일 객체를 리턴하기 때문에 <any>가 정답입니다!
      return message;
    });
  }

  ///////////////////////////////////////

  // 6. 특정 1:1 채팅방 과거 대화 내역 조회하기
  async getPrivateMessages(
    roomId: string,
    userId: string,
    dto: GetChatMessagesDto,
  ) {
    const room = await this.prisma.privateChatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('존재하지 않는 채팅방입니다.');

    if (room.userAId !== userId && room.userBId !== userId) {
      throw new ForbiddenException('본인이 속한 채팅방이 아닙니다.');
    }

    return await this.prisma.privateChat.findMany({
      // 👑 await 추가
      where: { roomId },
      take: dto.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, nickname: true, profileImg: true } },
      },
    });
  }
}
