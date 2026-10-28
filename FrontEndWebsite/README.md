# 🌐 ZelonGathering - Next.js Web Frontend (웹 프론트엔드)

> **Frontend web application for ZelonGathering.**  
> Built with Next.js App Router, it provides features including AI matching notifications, meetup creation and exploration, map interactions, and real-time WebSocket chat UI.
>
> `ZelonGathering`의 프론트엔드 웹입니다.  
> Next.js App Router 기반으로 구축되었으며, AI 매칭 알림, 소모임 개설 및 탐색, 지도 인터랙션, 실시간 웹소켓 채팅 UI를 제공합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: Next.js (App Router, React)
- **Language**: TypeScript
- **Data Fetching**: `@tanstack/react-query`
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io Client (WebSocket)
- **Styling & Icons**: Tailwind CSS, `lucide-react`
- **External APIs**: Google Maps API, Kakao REST API

---

## 📂 Directory Structure (디렉터리 구조)

```text
FrontEndWebsite/src/
├── app/                  # Next.js App Router page routing & handlers (App Router 기반 페이지 라우팅 & API)
│   ├── (tabs)/           # Main tab bar group routes (메인 탭바 그룹 라우트)
│   │   ├── page.tsx      # 🏠 Home tab: meetup exploration & recommendations (홈 탭: 소모임 탐색 및 추천)
│   │   ├── chats/        # 💬 Chat list tab for meetups & DMs (소모임 및 DM 채팅 목록 탭)
│   │   ├── matching/     # 🤖 AI meetup matching notification tab (AI 소모임 매칭 알림 탭)
│   │   └── profile/      # 👤 User profile tab (내 프로필 탭)
│   ├── api/              # Axios API clients & Next.js Route Handlers (Axios 클라이언트 및 Route Handler)
│   │   ├── geocode/      # Kakao REST API geocoding route handler (Kakao REST API 좌표-주소 변환)
│   │   └── ...           # Domain-specific Axios HTTP request modules (도메인별 Axios 요청 모듈)
│   ├── DM/               # 💬 1:1 and real-time WebSocket chat room page (1:1 및 실시간 웹소켓 채팅방 페이지)
│   ├── gatherings/       # 📍 Meetup detail, creation & map location selection pages (소모임 상세, 개설 및 지도 장소 선택)
│   ├── profileInfo/      # Other user's profile view page (상대방 프로필 보기 페이지)
│   ├── login/            # Authentication login route (로그인 관련 라우트)
│   └── signup/           # User registration route (회원가입 관련 라우트)
├── components/           # Modularized UI components e.g., modals and tab page blocks (모달, 탭별 페이지 구성 요소 등 UI 컴포넌트)
├── constants/            # Constants for meetup categories, days, regions, and time slots (소모임 카테고리, 요일, 지역, 시간대 상수)
├── hooks/                # React Query (useQuery, useMutation) custom hooks (React Query 기반 커스텀 훅)
├── types/                # Project-wide TypeScript type definitions: DTOs, models, etc. (프로젝트 전역 타입 정의: DTO, 모델 등)
└── utils/                # Global utility functions such as date formatting and helpers (날짜 포맷팅 및 전역 유틸리티 함수)
```
