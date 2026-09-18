# 💻 ZelonGathering - NestJS Core Server

`ZelonGathering` 서비스의 메인 백엔드 API 및 실시간 서버
사용자 인증, 프로필 관리, 소모임 비즈니스 로직, 웹소켓 기반 실시간 채팅, 그리고 AI 추천 파이프라인과의 연동을 담당함.

---

## 🛠️ Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (NeonDB)
- **Real-time**: Socket.io (WebSocket Gateway)
- **Storage**: Cloudflare R2 (via `@aws-sdk/client-s3`)
- **Authentication**: JWT (JSON Web Token)

---

## 📂 Core Modules & Features

### 1. 💬 `chats` Module

실시간 대화 및 메시지를 관리하는 모듈

- **WebSocket Gateway**: Socket.io 기반의 실시간 DM 네트워크 통신
- **Controller & Service**:
  - 소모임 채팅방 및 1:1 DM 채팅방 메시지 내역 조회
  - 메시지 전송 및 읽음 상태 처리
  - 모임별/유저별 채팅방 목록 구성 및 최신 메시지 동기화

---

### 2. 👥 `gatherings` Module

소모임 생성, 조회, 참여 관리 및 **AI 매칭 연동**을 담당하는 모듈

- **Controller & Service**:
  - 소모임 개설, 상세 정보 조회, 카테고리/요일/거리 기반 필터링
  - 모임 참여 신청 및 취소, 방장의 참여자 상태 변경
- **AI Matching Pipeline 연동**:
  - 소모임 신규 개설 시, 모임 정보(주제, 장소, 시간 등)와 방장 프로필 데이터를 **FastAPI (LLM Engine)** 서버로 전달
  - FastAPI 파이프라인과의 비동기 통신을 통한 사용자 대상 AI 소모임 매칭률 스코어링

---

### 3. 👤 `users` Module

사용자 계정, 인증/인가 및 프로필 관리를 담당하는 모듈

- **Authentication**: JWT(JsonWebToken) 기반 로그인 인증 및 Guards 구현
- **Controller & Service**:
  - 사용자 프로필 정보(MBTI, 취향 키워드, 선호 요일/시간/지역 등) 조회 및 수정
  - **이미지 업로드**: `S3Client`를 활용하여 Cloudflare R2에 이미지 업로드 후, 외부 접근을 위한 URL 생성 및 DB 저장

---

## 🚀 Getting Started

```bash
npm run start:dev
```
