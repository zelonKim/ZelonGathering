from pydantic import BaseModel, Field
from typing import List


class GatheringData(BaseModel):
    id: str
    title: str
    description: str
    category: str
    maxParticipants: int


class HostData(BaseModel):
    favorite: str | None = None
    hate: str | None = None
    age: int | None = None
    mbti: str | None = None


class CandidateUser(BaseModel):
    id: str
    favorite: str | None = None
    hate: str | None = None
    age: int | None = None
    mbti: str | None = None


class MatchingPayload(BaseModel):
    gathering: GatheringData
    host: HostData
    candidates: List[CandidateUser]


class RecommendedNotification(BaseModel):
    userId: str = Field(description="추천된 매칭 유저의 고유 ID")
    title: str = Field(description="유저에게 보낼 알림 제목")
    message: str = Field(description="유저별 맞춤형 추천 사유가 담긴 알림 메시지 본문")


class MatchingResponse(BaseModel):
    notifications: List[RecommendedNotification]
