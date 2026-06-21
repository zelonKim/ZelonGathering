import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Day,
  GatheringCategory,
  GatheringStatus,
  Prisma,
} from '@prisma/client';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { FilterGatheringDto } from './dto/filter-gathering.dto';

@Injectable()
export class GatheringsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 소모임 개설
  async create(hostId: string, dto: CreateGatheringDto) {
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

      // 소모임 참여 매칭 중간 테이블에 방장으로 자동 등록
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

    // 2️⃣ [Step 2] 백그라운드 AI 매칭 파이프라인 가동 🚀
    this.runAiMatchingPipeline(hostId, createdGathering, dto).catch((err) => {
      console.error('🤖 AI 매칭 파이프라인 에러 발생:', err);
    });

    return createdGathering;
  }

  private async runAiMatchingPipeline(
    hostId: string,
    gathering: any,
    dto: CreateGatheringDto,
  ) {
    // 방장 정보 가져오기
    const host = await this.prisma.user.findUnique({
      where: { id: hostId },
      select: { favorite: true, hate: true, age: true, mbti: true },
    });

    // 1차 하드 필터링: 4가지 조건(카테고리, 지역, 요일, 시간)이 '모두' 충족되는 유저만 긁어오기
    // DB 유저의 각 배열 필드에 방장이 설정한 단일 값이 '전부 포함'되어 있어야 합니다.
    const candidateUsers = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: hostId } }, // 방장 본인은 매칭 후보에서 제외
          { preferCategory: { has: dto.category } }, // 유저가 선호하는 카테고리 배열에 포함되어 있는가?
          { preferDistrict: { has: dto.district } }, // 유저가 선호하는 지역 배열에 포함되어 있는가?
          { preferDay: { hasSome: dto.gatheringDay } }, // 유저가 선호하는 요일 배열에 포함되어 있는가?
          { preferTime: { hasSome: dto.gatheringTime } }, // 유저가 선호하는 시간대 배열에 포함되어 있는가?
        ],
      },
      select: {
        id: true,
        favorite: true,
        hate: true,
        age: true,
        mbti: true,
      },
    });

    // 만약 매칭 대상 후보가 아무도 없다면 파이프라인 조기 종료
    if (candidateUsers.length === 0) return;

    // 3. FastAPI 서버로 데이터 전송할 Body 패킹
    const fastapiPayload = {
      gathering: {
        id: gathering.id,
        title: gathering.title,
        description: gathering.description,
        category: gathering.category,
        maxParticipants: gathering.maxParticipants,
      },
      host: {
        favorite: host?.favorite,
        hate: host?.hate,
        age: host?.age,
        mbti: host?.mbti,
      },
      candidates: candidateUsers, // AI가 분석할 타겟 유저 배열 데이터 전체
    };

    try {
      // 4. FastAPI 매칭 분석 API 호출
      const response = await fetch(
        `${process.env.FASTAPI_URL}/analyze-matching`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fastapiPayload),
        },
      );

      if (!response.ok) {
        throw new Error(`FastAPI 서버 응답 실패: ${response.status}`);
      }

      // FastAPI로부터 추천된 유저들의 알림 목록 수신
      const matchingNotifications: Array<{
        userId: string;
        title: string;
        message: string;
        matchRate: number;
      }> = await response.json();

      // 🚀 백엔드 벌크 인서트 구역 보완 코드
      if (matchingNotifications && matchingNotifications.length > 0) {
        await this.prisma.notification.createMany({
          data: matchingNotifications.map((noti) => {
            return {
              type: 'AI_MATCHING',
              userId: noti.userId,
              title: noti.title,
              message: noti.message,
              matchRate: noti.matchRate,
              linkId: gathering.id,
            };
          }),
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'FastAPI 매칭 분석 중 에러가 발생했습니다.',
        error.message,
      );
    }
  }

  /////////////////////////////////////////

  // 2. 모임 목록 조회
  async findAll(dto: FilterGatheringDto) {
    // 1. DTO에서 파라미터 구조 분해 할당
    let { types = [], categories = [], clientDay, latitude, longitude } = dto;

    const whereClause: any = {
      status: GatheringStatus.RECRUITING,
    };

    if (categories) {
      // 만약 categories가 배열이 아니라 순수 문자열('스터디')로 들어왔다면 ['스터디'] 배열로 수동 강제 변환합니다.
      if (!Array.isArray(categories)) {
        categories = [categories as unknown as string];
      }
    }

    // 🌟 [추가] 동일하게 types 또한 단일 값으로 들어올 때 .includes 등에서 터지는 것을 방지하기 위해 방어막을 칩니다.
    if (types && !Array.isArray(types)) {
      types = [types as unknown as string];
    }
    // ----------------------------------------------------------------------

    // [1] 카테고리 다중 필터링 (기존 성진님 코드 시작)
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
        // 🌟 [수정] !cat ➡️ !!cat 으로 변경 슛!
        // 존재하지 않는 잘못된 값(undefined)을 걸러내고 진짜 변환된 Enum 값만 쏙 남깁니다.
        .filter((cat) => !!cat);

      if (targetCategories.length > 0) {
        // ⚡️ 이제 정상적인 Enum 배열이 들어와 데이터베이스 쿼리가 완벽하게 수행됩니다!
        whereClause.category = { in: targetCategories };
      }
    }

    // --------------------------------------------------------
    // [2] 유저 편의 다중 필터링 (오늘 열리는 + 내일 열리는 조합 등)
    // --------------------------------------------------------
    // gatherings.service.ts 내부의 [2] 유저 편의 다중 필터링 영역 수정
    // --------------------------------------------------------
    // [2] 유저 편의 다중 필터링 (상호 배제 고려한 솎아내기)
    // --------------------------------------------------------
    let targetDay: Day | null = null;

    if (types.includes('오늘 열리는') || types.includes('내일 열리는')) {
      if (!clientDay) {
        throw new BadRequestException(
          '날짜 필터링을 위해 현재 요일(clientDay) 정보가 필요합니다.',
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

      // 프론트엔드가 혹여나 둘 다 보냈더라도 '오늘'을 우선하거나 단일 분기로 락을 겁니다.
      if (types.includes('오늘 열리는')) {
        targetDay = clientDay;
      } else if (types.includes('내일 열리는')) {
        targetDay = daysOrder[(currentIndex + 1) % 7];
      }

      if (targetDay) {
        // 단일 요일이 해당 모임 스케줄(Day[]) 배열 안에 쏙 들어있는지 확인
        whereClause.gatheringDay = {
          hasSome: [targetDay],
        };
      }
    }

    // 데이터베이스 조회 실행
    let gatherings = await this.prisma.gathering.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // 기본 정렬값
    });

    if (latitude && longitude) {
      gatherings = gatherings.map((g) => {
        const dist = this.calculateDistance(
          Number(latitude),
          Number(longitude),
          Number(g.latitude),
          Number(g.longitude),
        );
        return {
          ...g,
          distanceMetres: dist,
          distanceStr:
            dist >= 1000
              ? `${(dist / 1000).toFixed(1)}km`
              : `${Math.round(dist)}m`,
        };
      });
    }
    // --------------------------------------------------------
    // 거리순 정렬 결합
    // --------------------------------------------------------

    if (types.includes('거리순')) {
      if (!latitude || !longitude) {
        throw new BadRequestException(
          '거리순 조회를 위해 현재 위치 좌표가 필요합니다.',
        );
      }
      // 이미 위에서 distanceMetres가 계산되어 들어갔으므로 바로 정렬만 수행!
      gatherings.sort((a: any, b: any) => a.distanceMetres - b.distanceMetres);
    }

    return gatherings;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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

  // 4-1. 소모임 참여 신청 로직
  async join(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    // 방장은 참여 명단에 중복 가입할 필요가 없음
    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 모임에 참여 신청할 수 없습니다.',
      );
    }

    // 이미 참여한 멤버인지 확인
    const existingParticipant =
      await this.prisma.gatheringParticipant.findUnique({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

    if (existingParticipant) {
      return {
        message: '이 소모임에 참여하실 수 없습니다.',
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

      // 참여자 데이터 생성
      await tx.gatheringParticipant.create({
        data: { gatheringId, userId, status: 'ACCEPTED' },
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
    });
  }

  ////////////////////////////////////////

  // 4-2. 소모임 참여 취소 (방 나가기) 로직
  async leave(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) throw new NotFoundException('소모임이 존재하지 않습니다.');

    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 모임 참여를 취소할 수 없습니다.',
      );
    }

    // 참여 중인 인원인지 확인
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
      // 참여자 데이터 삭제
      await tx.gatheringParticipant.delete({
        where: {
          gatheringId_userId: { gatheringId, userId },
        },
      });

      const updated = await tx.gathering.update({
        where: { id: gatheringId },
        data: {
          currentParticipants: { decrement: 1 },
          status: gathering.status === 'FULL' ? 'RECRUITING' : gathering.status,
        },
      });

      return {
        message: '소모임 참여를 취소했습니다.',
        currentParticipants: updated.currentParticipants,
      };
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

  /////////////////////////////////////////

  // 7. [방장 전용] 신청자 명단 조회 로직
  async getParticipants(gatheringId: string, hostId: string) {
    // 요청한 사람이 방장이 맞는지 검증
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });
    if (!gathering) throw new NotFoundException('존재하지 않는 소모임입니다.');
    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('신청자 명단을 조회할 권한이 없습니다.');
    }

    // 해당 모임의 모든 참여 신청자 목록 반환 (방장 제외)
    return await this.prisma.gatheringParticipant.findMany({
      where: {
        gatheringId,
        userId: { not: hostId },
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

  /////////////////////////////////////////

  // 8. [방장 전용] 참여 신청 승인/거절 처리 로직
  async reviewParticipant(
    gatheringId: string,
    hostId: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) {
    // 소모임 및 방장 권한 체크
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });
    if (!gathering) throw new NotFoundException('존재하지 않는 소모임입니다.');
    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여 신청을 관리할 수 있습니다.');
    }

    // 대상 유저의 신청 내역이 존재하는지 체크
    const participant = await this.prisma.gatheringParticipant.findUnique({
      where: { gatheringId_userId: { gatheringId, userId } },
    });
    if (!participant)
      throw new NotFoundException('해당 유저의 참여 신청 내역이 없습니다.');

    // 승인(ACCEPTED)일 경우 정원 초과 체크 및 인원수 조절을 위해 트랜잭션 처리
    return await this.prisma.$transaction<any>(async (tx) => {
      if (status === 'ACCEPTED') {
        if (gathering.currentParticipants >= gathering.maxParticipants) {
          throw new BadRequestException(
            '모임 정원이 초과되어 승인할 수 없습니다.',
          );
        }

        // 소모임의 현재 참여 인원수 1 증가
        await tx.gathering.update({
          where: { id: gatheringId },
          data: { currentParticipants: { increment: 1 } },
        });
      }

      // 신청 상태 변경 (ACCEPTED 또는 REJECTED)
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
