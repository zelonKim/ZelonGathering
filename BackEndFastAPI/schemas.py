from pydantic import BaseModel, Field


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
    candidates: list[CandidateUser]


#############################################################


class RecommendedNotification(BaseModel):
    userId: str = Field(description="매칭된 유저의 고유 ID")
    title: str = Field(description="소모임 매칭 알림 제목")
    message: str = Field(description="해당 소모임 추천 사유 및 메시지 본문")
    matchRate: int = Field(description="추천된 소모임과 유저간의 매칭률")


class MatchingResponse(BaseModel):
    notifications: list[RecommendedNotification]
