import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Day,
  GatheringCategory,
  GatheringStatus,
  Prisma,
} from '@prisma/client';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { FilterGatheringDto } from './dto/filter-gathering.dto';
import { runAiMatchingPipeline } from '../utils/runAiMatchingPipeline';
import { calculateDistance } from '../utils/calculateDistance';

@Injectable()
export class GatheringsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 소모임 개설
  async createGathering(hostId: string, dto: CreateGatheringDto) {
    const {
      title,
      description,
      category,
      maxParticipants,
      gatheringPlace,
      latitude,
      longitude,
      district,
      gatheringDay,
      gatheringTime,
    } = dto;

    const createdGathering = await this.prisma.$transaction(async (tx) => {
      const gathering = await tx.gathering.create({
        data: {
          hostId,
          title,
          description,
          category,
          maxParticipants,
          currentParticipants: 1,
          gatheringPlace,
          latitude: new Prisma.Decimal(latitude.toString()),
          longitude: new Prisma.Decimal(longitude.toString()),
          district,
          gatheringDay,
          gatheringTime,
          status: 'RECRUITING',
        },
      });

      await tx.gatheringParticipant.create({
        data: {
          gatheringId: gathering.id,
          userId: hostId,
          role: 'HOST',
          status: 'ACCEPTED',
        },
      });

      return gathering;
    });

    //  AI 소모임 매칭 파이프라인 가동
    runAiMatchingPipeline(this.prisma, hostId, createdGathering, dto).catch(
      (err) => {
        console.error('🤖 AI 소모임 매칭 파이프라인 에러:', err);
      },
    );

    return createdGathering;
  }

  ///////////////////////////////////////////////////////////////////////

  // 2. 소모임 전체 조회
  async findAllGathering(dto: FilterGatheringDto) {
    let { types = [], categories = [] } = dto;
    const { clientDay, latitude, longitude } = dto;

    const whereClause: Prisma.GatheringWhereInput = {
      status: GatheringStatus.RECRUITING,
    };

    if (types && !Array.isArray(types)) {
      types = [types];
    }

    if (categories) {
      if (!Array.isArray(categories)) {
        categories = [categories];
      }
    }

    if (categories.length > 0 && !categories.includes('전체')) {
      const categoryMap: Record<string, GatheringCategory> = {
        스터디: GatheringCategory.STUDY,
        스포츠: GatheringCategory.SPORTS,
        아트: GatheringCategory.ART,
        푸드: GatheringCategory.FOOD,
        게임: GatheringCategory.GAME,
        독서: GatheringCategory.BOOK,
        토크: GatheringCategory.TALK,
        투어: GatheringCategory.TOUR,
      };

      const targetCategories = categories
        .map((cat) => categoryMap[cat])
        .filter((cat) => !!cat);

      if (targetCategories.length > 0) {
        whereClause.category = { in: targetCategories };
      }
    }

    let targetDay: Day | null = null;

    if (types.includes('오늘 열리는') || types.includes('내일 열리는')) {
      if (!clientDay) {
        throw new BadRequestException(
          '날짜 필터링을 위해 현재 요일 정보가 필요합니다.',
        );
      }

      const daysOrder: Day[] = [
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
        'SUN',
      ];

      const currentIndex = daysOrder.indexOf(clientDay);

      if (types.includes('오늘 열리는')) {
        targetDay = clientDay;
      } else if (types.includes('내일 열리는')) {
        targetDay = daysOrder[(currentIndex + 1) % 7];
      }

      if (targetDay) {
        whereClause.gatheringDay = {
          hasSome: [targetDay],
        };
      }
    }

    const dayFilteredGatherings = await this.prisma.gathering.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    if (types.includes('거리순')) {
      if (!latitude || !longitude) {
        throw new BadRequestException(
          '거리순 조회를 위해 위치 좌표가 필요합니다.',
        );
      }

      const disFilteredGatherings = dayFilteredGatherings.map((gat) => {
        const dis = calculateDistance(
          Number(latitude),
          Number(longitude),
          Number(gat.latitude),
          Number(gat.longitude),
        );

        return {
          ...gat,
          distanceMetres: dis,
          distanceStr:
            dis >= 1000
              ? `${(dis / 1000).toFixed(1)}km`
              : `${Math.round(dis)}m`,
        };
      });

      disFilteredGatherings.sort((a, b) => a.distanceMetres - b.distanceMetres);

      return disFilteredGatherings;
    }

    return dayFilteredGatherings;
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // 3. 소모임 상세 조회
  async findOneGathering(id: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            profileImg: true,
            mannerTemperature: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                nickname: true,
                profileImg: true,
                mannerTemperature: true,
              },
            },
          },
        },
      },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 소모임입니다.');
    }

    return gathering;
  }

  /////////////////////////////////////////////////////////////////

  // 4. 소모임 참여 신청
  async joinGathering(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 소모임에 참여 신청할 수 없습니다.',
      );
    }

    const existingParticipant =
      await this.prisma.gatheringParticipant.findUnique({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

    if (existingParticipant) {
      return {
        message: '이미 참여중인 소모임 입니다.',
        currentParticipants: gathering.currentParticipants,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      if (gathering.status !== 'RECRUITING') {
        throw new BadRequestException('모집 중인 소모임이 아닙니다.');
      }

      if (gathering.currentParticipants >= gathering.maxParticipants) {
        throw new BadRequestException('정원이 초과된 소모임입니다.');
      }

      await tx.gatheringParticipant.create({
        data: { gatheringId, userId, status: 'ACCEPTED' },
      });

      const nextCount = gathering.currentParticipants + 1;

      const isFull = nextCount >= gathering.maxParticipants;

      const updatedStatus = await tx.gathering.update({
        where: { id: gatheringId },
        data: {
          currentParticipants: { increment: 1 },
          status: isFull ? 'FULL' : 'RECRUITING',
        },
      });

      return {
        message: '소모임에 성공적으로 참여했습니다.',
        currentParticipants: updatedStatus.currentParticipants,
      };
    });
  }

  ////////////////////////////////////////////////////////////////

  // 5. 소모임 참여 취소
  async leaveGathering(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 모임 참여를 취소할 수 없습니다.',
      );
    }

    const existingParticipant =
      await this.prisma.gatheringParticipant.findUnique({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

    if (!existingParticipant) {
      throw new BadRequestException('참여하고 있지 않은 소모임입니다.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.gatheringParticipant.delete({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

      const updatedStatus = await tx.gathering.update({
        where: { id: gatheringId },
        data: {
          currentParticipants: { decrement: 1 },
          status: gathering.status === 'FULL' ? 'RECRUITING' : gathering.status,
        },
      });

      return {
        message: '소모임 참여를 취소했습니다.',
        currentParticipants: updatedStatus.currentParticipants,
      };
    });
  }

  /////////////////////////////////////////////////////////////////

  // 6. 소모임 상태 변경 (방장 전용)
  async updateStatusGathering(
    id: string,
    hostId: string,
    status: GatheringStatus,
  ) {
    const gathering = await this.prisma.gathering.findUnique({ where: { id } });
    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId !== hostId)
      throw new ForbiddenException('소모임 상태를 변경할 권한이 없습니다.');

    return this.prisma.gathering.update({
      where: { id },
      data: { status },
    });
  }

  /////////////////////////////////////////////////////////////////

  // 7. 소모임 삭제 (방장 전용)
  async removeGathering(id: string, hostId: string) {
    const gathering = await this.prisma.gathering.findUnique({ where: { id } });
    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId !== hostId)
      throw new ForbiddenException('소모임을 삭제할 권한이 없습니다.');

    await this.prisma.gathering.delete({ where: { id } });

    return { success: true, message: '소모임이 정상적으로 삭제되었습니다.' };
  }

  /////////////////////////////////////////////////////////////////

  // 8. 소모임 신청자 조회
  async getParticipants(gatheringId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });
    if (!gathering) throw new NotFoundException('존재하지 않는 소모임입니다.');

    return await this.prisma.gatheringParticipant.findMany({
      where: {
        gatheringId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImg: true,
            mannerTemperature: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  //////////////////////////////////////////////////////////

  // 9. 참여 신청 승인/거절
  async reviewParticipant(
    gatheringId: string,
    hostId: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });
    if (!gathering) throw new NotFoundException('존재하지 않는 소모임입니다.');

    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여 신청을 관리할 수 있습니다.');
    }

    const participant = await this.prisma.gatheringParticipant.findUnique({
      where: { gatheringId_userId: { gatheringId, userId } },
    });
    if (!participant) throw new NotFoundException('참여 신청 내역이 없습니다.');

    return await this.prisma.$transaction(async (tx) => {
      if (status === 'ACCEPTED') {
        if (gathering.currentParticipants >= gathering.maxParticipants) {
          throw new BadRequestException(
            '모임 정원이 초과되어 승인할 수 없습니다.',
          );
        }

        await tx.gathering.update({
          where: { id: gatheringId },
          data: { currentParticipants: { increment: 1 } },
        });
      }

      return await tx.gatheringParticipant.update({
        where: { gatheringId_userId: { gatheringId, userId } },
        data: { status },
        include: {
          user: { select: { nickname: true } },
        },
      });
    });
  }
}
