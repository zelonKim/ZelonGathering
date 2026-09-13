import { Gathering } from '@prisma/client';
import { CreateGatheringDto } from '../gatherings/dto/create-gathering.dto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

export const runAiMatchingPipeline = async (
  prisma: PrismaService,
  hostId: string,
  gathering: Gathering,
  dto: CreateGatheringDto,
) => {
  const host = await prisma.user.findUnique({
    where: { id: hostId },
    select: { favorite: true, hate: true, age: true, mbti: true },
  });

  const candidateUsers = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: hostId } }, // 방장 본인은 소모임 매칭 후보에서 제외함.
        { preferCategory: { has: dto.category } }, // 유저가 선호하는 카테고리에 포함되어 있는지
        { preferDistrict: { has: dto.district } }, // 유저가 선호하는 지역에 포함되어 있는지
        { preferDay: { hasSome: dto.gatheringDay } }, // 유저가 선호하는 요일에 포함되어 있는지
        { preferTime: { hasSome: dto.gatheringTime } }, // 유저가 선호하는 시간대에 포함되어 있는지
      ],
    },
    select: {
      id: true,
      age: true,
      mbti: true,
      favorite: true,
      hate: true,
    },
  });

  // 소모임 매칭 후보가 한명도 없을 경우, 파이프라인 조기 종료
  if (candidateUsers.length === 0) return;

  // FastAPI 서버로 전송할 데이터
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
    candidates: candidateUsers,
  };

  try {
    // FastAPI 소모임 매칭 API 호출
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

    // 매칭된 알림 목록 수신
    const matchingNotifications = (await response.json()) as {
      userId: string;
      title: string;
      message: string;
      matchRate: number;
    }[];

    if (matchingNotifications && matchingNotifications.length > 0) {
      await prisma.notification.createMany({
        data: matchingNotifications.map((noti) => {
          return {
            userId: noti.userId,
            title: noti.title,
            message: noti.message,
            matchRate: noti.matchRate,
            linkId: gathering.id,
          };
        }),
      });
    }
  } catch (err) {
    throw new InternalServerErrorException(
      'FastAPI 매칭 분석 중 에러가 발생했습니다.',
      { cause: err instanceof Error ? err : new Error(String(err)) },
    );
  }
};
