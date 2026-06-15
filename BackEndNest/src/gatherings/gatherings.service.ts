import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { FilterGatheringDto } from './dto/filter-gathering.dto';

@Injectable()
export class GatheringsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 소모임 개설 및 방장 자동 참여 트랜잭션
  async create(hostId: string, dto: CreateGatheringDto) {
    const {
      title,
      description,
      category,
      maxParticipants,
      latitude,
      longitude,
      locationName,
      gatheringAt,
    } = dto;

    // 모임 생성 + 참여자 명단(Participant)에 방장을 추가하는 트랜잭션 처리
    return this.prisma.$transaction(async (tx) => {
      const gathering = await tx.gathering.create({
        data: {
          hostId,
          title,
          description,
          category,
          maxParticipants,
          currentParticipants: 1,
          latitude: new Prisma.Decimal(latitude),
          longitude: new Prisma.Decimal(longitude),
          locationName,
          gatheringAt: new Date(gatheringAt),
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
  }

  /////////////////////////////////////////

  // 2. 위치 기반 모임 목록 조회
  async findAll(dto: FilterGatheringDto) {
    const { latitude, longitude, radius, category } = dto;

    // 기본 조건 구조 세팅
    const whereClause: any = {
      status: 'RECRUITING', // 모집 중인 것만 기본 노출
    };

    if (category) {
      whereClause.category = category;
    }

    const gatherings = await this.prisma.gathering.findMany({
      where: whereClause,
      include: {
        host: {
          select: { nickname: true, mannerTemperature: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 위도, 경도 좌표가 넘어온 경우 km 단위 근사치 반경 필터링 수행
    if (latitude && longitude) {
      return gatherings.filter((g) => {
        const latDiff = Math.abs(Number(g.latitude) - latitude) * 111; // 1도 ≒ 111km
        const lngDiff = Math.abs(Number(g.longitude) - longitude) * 88; // 대한민국 위도 기준 1도 ≒ 88km
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        return distance <= radius;
      });
    }

    return gatherings;
  }

  /////////////////////////////////////////

  // 3. 소모임 상세 조회
  async findOne(id: string) {
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

  /////////////////////////////////////////

  // 4. 소모임 참여 및 취소
  async toggleJoin(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId === userId)
      throw new BadRequestException(
        '방장은 본인의 모임 참여를 취소할 수 없습니다.',
      );

    // 이미 참여한 멤버인지 확인
    const existingParticipant =
      await this.prisma.gatheringParticipant.findUnique({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

    return this.prisma.$transaction(async (tx) => {
      if (existingParticipant) {
        await tx.gatheringParticipant.delete({
          where: { gatheringId_userId: { gatheringId, userId } },
        });

        const updated = await tx.gathering.update({
          where: { id: gatheringId },
          data: {
            currentParticipants: { decrement: 1 },
            status:
              gathering.status === 'FULL' ? 'RECRUITING' : gathering.status, // 꽉 찼다가 풀리면 상태 복구
          },
        });
        return {
          message: '소모임 참여를 취소했습니다.',
          currentParticipants: updated.currentParticipants,
        };
      } else {
        // 새로 참여 처리
        if (gathering.status !== 'RECRUITING') {
          throw new BadRequestException('모집 중인 소모임이 아닙니다.');
        }
        if (gathering.currentParticipants >= gathering.maxParticipants) {
          throw new BadRequestException('정원이 초과된 소모임입니다.');
        }

        await tx.gatheringParticipant.create({
          data: { gatheringId, userId },
        });

        const nextCount = gathering.currentParticipants + 1;
        const isFull = nextCount >= gathering.maxParticipants;

        const updated = await tx.gathering.update({
          where: { id: gatheringId },
          data: {
            currentParticipants: { increment: 1 },
            status: isFull ? 'FULL' : 'RECRUITING',
          },
        });
        return {
          message: '소모임에 성공적으로 참여했습니다.',
          currentParticipants: updated.currentParticipants,
        };
      }
    });
  }

  /////////////////////////////////////////

  // 5. 소모임 상태 수동 변경 (방장 전용 권한)
  async updateStatus(id: string, hostId: string, status: any) {
    const gathering = await this.prisma.gathering.findUnique({ where: { id } });
    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId !== hostId)
      throw new ForbiddenException('모임 상태를 변경할 권한이 없습니다.');

    return this.prisma.gathering.update({
      where: { id },
      data: { status },
    });
  }

  /////////////////////////////////////////

  // 6. 소모임 삭제 (방장 전용 권한)
  async remove(id: string, hostId: string) {
    const gathering = await this.prisma.gathering.findUnique({ where: { id } });
    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId !== hostId)
      throw new ForbiddenException('소모임을 삭제할 권한이 없습니다.');

    await this.prisma.gathering.delete({ where: { id } });
    return { success: true, message: '소모임이 정상적으로 삭제되었습니다.' };
  }
}
