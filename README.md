# ** 👋 AI 기반 맞춤형 소모임 매칭 플랫폼 ZelonGathering**  

> 사용자의 프로필, 취향, 활동 조건(지역/시간/요일)을 다각도로 분석하여 **AI가 최적의 소모임을 추천**해줍니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
* **Web**: `Next.js`, `TypeScript`, `Tailwind CSS`
* **App**: `React Native (Expo)`, `TypeScript`

### Backend & AI
* **Main Server**: `Nest`,`TypeScript`
* **AI/Matching Engine**: `FastAPI`, `OpenAI API (GPT-4o-mini)`

### Database & External APIs
* **Database**: `PostgreSQL`, `NeonDB`
* **Maps & Location**: `Google Maps API`, `Kakao REST API`

---

## 🔑 주요 기능 (Key Features)

* 🤖 **AI 소모임 매칭 및 알림**
  * 사용자의 프로필(나이, MBTI, 취향 키워드, 관심 카테고리) 및 선호 활동 조건(지역, 요일, 시간대) 분석
  * OpenAI GPT-4o-mini 모델 기반으로 가장 적합한 소모임을 스코어링하여 **매칭 알림** 발송

* 🔍 **조건별 소모임 탐색 및 스마트 필터링**
  * 소모임 카테고리별/일정별 필터링 제공
  * 사용자 기준 **위치 기반 거리순** 탐색 기능

* 📍 **지도 기반 소모임 개설**
  * 소모임 장소 등록 시, 지도에서 원하는 위치에 마킹하여 장소 지정

* 💬 **실시간 소모임 & 1:1 채팅**
  * 소모임 참여 멤버들과의 **실시간 그룹 채팅** 기능
  * 관심 있는 사용자 간 **1:1 DM(Direct Message)** 실시간 소통 기능

