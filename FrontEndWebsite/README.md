# 🌐 ZelonGathering - Next.js Web Frontend

`ZelonGathering`의 프론트엔드 웹
Next.js App Router 기반으로 구축되었으며, AI 매칭 알림, 소모임 개설 및 탐색, 지도 인터랙션, 실시간 웹소켓 채팅 UI를 제공함.

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Data Fetching**: `@tanstack/react-query`
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Styling & Icons**: Tailwind CSS, Lucide React
- **External APIs**: Google Maps API, Kakao REST API

---

## 📂 Project Structure & Directory Guide

FrontEndWebsite/src/
├── app/ # Next.js App Router 기반 페이지 라우팅 & API
│ ├── (tabs)/ # 메인 탭바 그룹 라우트 (하단 탭 구성)
│ │ ├── page.tsx # 🏠 홈 탭 (소모임 탐색 및 추천)
│ │ ├── chats/ # 💬 소모임 및 DM 채팅 목록 탭
│ │ ├── matching/ # 🤖 AI 소모임 매칭 알림 탭
│ │ └── profile/ # 👤 내 프로필 탭
│ ├── api/ # Axios API 클라이언트 및 Next.js Route Handler
│ │ ├── geocode/ # Kakao REST API 연동 Route Handler (좌표-주소 변환)
│ │ └── ... # 도메인별 Axios HTTP 요청 전송 모듈
│ ├── DM/ # 💬 1:1 및 실시간 웹소켓 채팅방 페이지
│ │── gatherings/ # 📍 소모임 상세, 개설 및 지도 장소 선택 페이지
│ │── profileInfo/ # 상대방 프로필 보기 페이지
│ │── login/ # 로그인 관련 라우트
│ └── signup/ # 회원가입 관련 라우트
├── components/ # 모달, 탭별 페이지 구성 요소 등 모듈화된 UI 컴포넌트
├── constants/ # 소모임 카테고리, 요일, 선호 지역, 시간대 상수 데이터
├── hooks/ # React Query(useQuery, useMutation) 기반 커스텀 훅
├── types/ # 프로젝트 전역 TypeScript 타입 정의 (DTO, 모델 등)
└── utils/ # 날짜 포맷팅, 헬퍼 함수 등 전역 유틸리티 함수

## 🚀 Getting Started

```bash
npm run dev
```
