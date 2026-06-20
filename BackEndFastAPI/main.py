import os
from typing import List
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from schemas import RecommendedNotification, MatchingPayload, MatchingResponse
from dotenv import load_dotenv


load_dotenv()

app = FastAPI()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])


@app.post("/analyze-matching", response_model=List[RecommendedNotification])
async def analyze_matching(payload: MatchingPayload):
    gathering = payload.gathering
    host = payload.host
    candidates = payload.candidates

    if not candidates:
        return []

    # 1. OpenAI 프롬프트에 주입할 유저 데이터 파싱
    candidates_text = ""
    for idx, c in enumerate(candidates):
        candidates_text += f"[{idx}] 유저 ID: {c.id} | 나이: {c.age} | MBTI: {c.mbti} | 좋아하는 것: {c.favorite} | 싫어하는 것: {c.hate}\n"

    # 2. 페르소나 및 정밀 가이드라인 프롬프트 작성
    system_prompt = (
        "당신은 대한민국 2030을 위한 오프라인 소모임 플랫폼의 '트렌디하고 위트 있는 AI 매칭 분석가'입니다.\n"
        "새로 열린 소모임 정보, 방장(Host) 성향, 1차 필터링을 통과한 유저 후보군(Candidates)을 분석하여\n"
        "방장과 소모임 구성원 전체가 찰떡 케미를 이룰 최적의 멤버를 선출해야 합니다.\n\n"
        "⏰ [선출 인원 제한 법칙]\n"
        f"반드시 후보군 중에서 가장 핏이 잘 맞는 핵심 유저를 딱 '{gathering.maxParticipants - 1}'명만 골라내야 합니다. 절대로 이 숫자를 초과해서 선출하지 마십시오.\n\n"
        "🧠 [초정밀 AI 매칭 알고리즘 가이드라인]\n"
        "1. 취향 동질성 (Favorite Match) [최우선 가산점]:\n"
        "   - 모임의 주제(카테고리, 제목, 설명) 및 방장의 favorite 단어와 유저의 favorite 단어 간의 연관성이 높을수록 최우선 순위로 배치합니다.\n\n"
        "2. 빌런 및 지뢰 피하기 (Hate Filter) [절대 격리]:\n"
        "   - 방장의 hate 요소가 유저의 favorite에 있거나, 유저의 hate 요소가 방장의 favorite/모임 스펙에 단 하나라도 포착되면 '무조건 낙제점'을 주고 추천에서 즉시 제외하십시오.\n\n"
        "3. ❌ 🔥 MBTI 파괴적 파국 궁합 절대 진입 금지 규칙 🔥:\n"
        "   - [최악의 파국 조합]: (INFP-ESTP), (ENFP-ISTP), (INTJ-ESFJ), (ENFJ-ISTJ), (ISFP-ENTP), (ESFP-INTP), (ISTJ-ENFJ), (ESTJ-INFJ)\n"
        "   - 방장의 MBTI와 유저 후보의 MBTI가 위 '최악의 파국 조합' 쌍 중 하나라도 해당하면, 좋아하는 것(Favorite)이나 다른 조건이 아무리 잘 맞더라도 매칭 점수를 0점 처리하고, 후보군에서 무조건 제외 시키십시오.\n"
        "   - 가급적 서로 소통이 잘 통하는 성향 조합(예: NF 계열끼리, ST 계열끼리, 혹은 대화가 부드럽게 통하는 궁합)을 선출하세요.\n\n"
        "4. 또래 및 연령대 균형:\n"
        "   - 방장의 나이와 비교해 너무 동떨어지지 않고 자연스럽게 섞일 수 있는 또래 연령대를 우대합니다.\n\n"
        "✉️ [매칭 알림 톤앤매너]\n"
        "유저들의 스마트폰 푸시 알림으로 떴을 때, 뻔한 광고 같지 않고 호기심이 생겨 '무조건 클릭'하게 만드는 힙한 톤으로 작성하세요.\n\n"
        "❌ [금지어 목록 - 쓰면 감점]:\n"
        "   - '취향 저격', '놓치지 마세요', '환상적인', '완벽한 케미', '지금 바로', '주목!', '배달', '추천드립니다'\n"
        "   - 위와 같은 진부하고 정형화된 마케팅용 단어는 절대, 단 한 번도 사용하지 마십시오.\n\n"
        "📌 title (알림 제목) 작성 룰:\n"
        "   - 15자 내외로 짧고 강렬하게, 이모지(1개)와 함께 힙한 유행어나 위트 있는 문구로 짜세요.\n"
        "   - 패턴 예시: '👀 자느라 이거 못 보면 손해', '🔥 강남역에 뜬 역대급 스터디 조합', '초면에 실례지만 님 취향 발견함'\n\n"
        "📌 message (알림 내용) 작성 룰:\n"
        "   - 뚱딴지같은 소리 하지 말고, 해당 유저가 입력한 '좋아하는 것(favorite)' 문구를 명확히 인용하며 소모임 주제와 엮어 정확히 1문장의 친근한 해요체로 작성하세요.\n"
        "   - '~~를 좋아하시는 유저님을 위해 준비했어요' 같은 식상한 문장 금지.\n"
        "   - 패턴 예시: '평소에 방구석에서 뚱땅뚱땅 코딩하는 거 좋아하신댔죠? 마침 강남역에 결이 딱 맞는 고수들 모임이 생겼어요, 같이 껴서 놀아봐요!'"
        "📌 matchRate (매칭률) 작성 룰:\n"
        "   - 매칭률은 무조건 '80'에서 '100' 사이의 정수(Integer)로만 산출하십시오. (80점 미만 산출 절대 금지)"
        "   - 이미 Hate 필터와 MBTI 파국 궁합을 모두 통과한 정예 후보들이므로, 기본 점수(Baseline)를 80점으로 시작합니다."
        "   - 여기에 방장과의 '취향 동질성(Favorite Match)'이 높을수록, 그리고 연령 차이가 적을수록 100점에 가깝게 가산점을 부여하세요."
        "   - 데이터 분석 결과에 따라 80~99점 사이로 꼼꼼하게 변별력을 주어 세밀하게 계산하세요"
        "   - 오히려 신뢰도가 떨어질 수 있으니 절대 100점은 주지마세요."
        "🚨 [데이터 무결성 절대 준수 규칙]\n"
        "- 선출된 유저의 ID는 반드시 전달받은 후보군(Candidates)의 ID 목록에 존재하는 값이어야 합니다.\n"
        "- 임의로 가짜 ID를 생성하거나 수정하지 말고, 후보군의 고유 ID(userId)를 그대로 사용하십시오.\n"
    )

    user_prompt = (
        f"🏠 [새로 열린 소모임 정보]\n"
        f"- 제목: {gathering.title}\n"
        f"- 카테고리: {gathering.category}\n"
        f"- 설명: {gathering.description}\n"
        f"- 모집 정원: {gathering.maxParticipants}명\n\n"
        f"👑 [방장(Host)의 성향]\n"
        f"- 나이: {host.age} | MBTI: {host.mbti}\n"
        f"- 좋아하는 것: {host.favorite}\n"
        f"- 싫어하는 것: {host.hate}\n\n"
        f"👥 [1차 필터링을 통과한 유저 후보군]\n"
        f"{candidates_text}"
    )

    try:
        # 3. OpenAI 구조화된 응답(Structured Outputs) 호출
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=MatchingResponse,
        )

        ai_result = completion.choices[0].message.parsed

        return ai_result.notifications

    except Exception as e:
        print(f"🚨 OpenAI 분석 중 장애 발생: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"AI Matching Analysis Failed: {str(e)}"
        )
