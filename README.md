# 👋 ZelonGathering - AI-Powered Personalized Meetup Platform (AI 기반 맞춤형 소모임 매칭 플랫폼)

> **Analyzes user profiles, interests, and activity preferences (location/time/day) from multiple dimensions to deliver optimal AI-driven meetup recommendations.**
>
> 사용자의 프로필, 취향, 활동 조건(지역/시간/요일)을 다각도로 분석하여 **AI가 최적의 소모임을 추천**해줍니다.

---

## 🛠 Tech Stack (기술 스택)

### Frontend

- **Web**: Next.js (App Router), TypeScript, Tailwind CSS
- **Mobile App**: React Native (Expo), TypeScript

### Backend & AI

- **Main Server**: NestJS, TypeScript
- **AI / Matching Engine**: FastAPI, Python, OpenAI API (`gpt-4o-mini`)

### Database & External APIs

- **Database**: PostgreSQL, NeonDB
- **Maps & Location**: Google Maps API, Kakao REST API

---

## 🔑 Key Features (주요 기능)

### 🤖 1. AI Meetup Matching & Notifications (AI 소모임 매칭 및 알림)

- **Multidimensional Profile Analysis (프로필 분석)**: Analyzes user profile data `age, MBTI, interest keywords, preferred categories` alongside activity preferences `region, preferred day of the week, time slot`. (사용자의 프로필 `나이, MBTI, 취향 키워드, 관심 카테고리` 및 선호 활동 조건 `지역, 요일, 시간대` 분석)
- **GPT-4o-mini Scoring & Alerts (매칭 스코어링)**: Leverages OpenAI `gpt-4o-mini` to score compatibility and dispatch real-time matching notifications for top-matched meetups. (OpenAI GPT-4o-mini 모델 기반으로 가장 적합한 소모임을 스코어링하여 **매칭 알림** 발송)

### 🔍 2. Smart Search & Filtering (조건별 소모임 탐색 및 스마트 필터링)

- **Category & Schedule Filters (카테고리별 필터링)**: Offers multi-attribute filtering by meetup category and event schedule. (소모임 카테고리별/일정별 필터링 제공)
- **Location-Based Distance Search (위치 기반 탐색)**: Enables distance-sorted meetup exploration relative to user's current location. (사용자 기준 **위치 기반 거리순** 탐색 기능)

### 📍 3. Map-Based Meetup Creation (지도 기반 소모임 개설)

- **Interactive Location Pinning (장소 지정)**: Allows hosts to pinpoint exact meeting locations on an interactive map when creating a new meetup. (소모임 장소 등록 시, 지도에서 원하는 위치에 마킹하여 장소 지정)

### 💬 4. Real-Time Group & 1:1 Chat (실시간 소모임 & 1:1 채팅)

- **Group Chatting (실시간 그룹 채팅)**: Features real-time group chat rooms for participating meetup members. (소모임 참여 멤버들과의 **실시간 그룹 채팅** 기능)
- **Direct Messaging (1:1 DM)**: Enables real-time 1:1 direct messaging between interested users. (관심 있는 사용자 간 **1:1 DM** 실시간 소통 기능)
