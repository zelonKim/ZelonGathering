# 💻 ZelonGathering - NestJS Core Server (NestJS 메인 백엔드 서버)

> **Main backend API and real-time server for the ZelonGathering service.**  
> Responsible for user authentication, profile management, meetup business logic, WebSocket-based real-time chat, and integration with the AI recommendation pipeline.
>
> `ZelonGathering` 서비스의 메인 백엔드 API 및 실시간 서버입니다.  
> 사용자 인증, 프로필 관리, 소모임 비즈니스 로직, 웹소켓 기반 실시간 채팅, 그리고 AI 추천 파이프라인과의 연동을 담당합니다.

---

## 🛠️ Tech Stack (기술 스택)

- **Framework**: NestJS (TypeScript)
- **Database & ORM**: PostgreSQL, NeonDB, Prisma ORM
- **Real-time Communication**: WebSocket / Socket.io Gateway
- **Media Storage**: Cloudflare R2 (via `@aws-sdk/client-s3`)
- **Authentication**: JWT (JSON Web Token)

---

## 📂 Core Modules & Features (핵심 모듈 및 기능)

### 1. 💬 `chats` Module (실시간 채팅 모듈)

Manages real-time conversations and messaging. (실시간 대화 및 메시지를 관리하는 모듈)

- **WebSocket Gateway (실시간 메시징)**: Enables Socket.io-based real-time 1:1 direct messaging and group chat networks. (Socket.io 기반의 실시간 DM 및 그룹 네트워크 통신)
- **Message Management (메시지 관리)**:
  - Retrieves message history for meetup group chats and 1:1 DM chat rooms. (소모임 채팅방 및 1:1 DM 채팅방 메시지 내역 조회)
  - Processes message transmission and read-receipt status. (메시지 전송 및 읽음 상태 처리)
  - Constructs user/meetup chat lists and synchronizes recent messages. (모임별/유저별 채팅방 목록 구성 및 최신 메시지 동기화)

---

### 2. 👥 `gatherings` Module (소모임 및 AI 매칭 모듈)

Handles meetup creation, exploration, participation management, and **AI matching pipeline integration**. (소모임 생성, 조회, 참여 관리 및 **AI 매칭 연동**을 담당하는 모듈)

- **Gathering Business Logic (소모임 비즈니스 로직)**:
  - Meetup creation, detailed view fetching, and smart filtering by category, schedule, or location distance. (소모임 개설, 상세 정보 조회, 카테고리/요일/거리 기반 필터링)
  - Manages join requests, cancellations, and host status updates for participants. (모임 참여 신청 및 취소, 방장의 참여자 상태 변경)
- **AI Matching Pipeline (AI 매칭 연동)**:
  - Upon new meetup creation, forwards meetup metadata (topic, location, schedule) and host profile data to the **FastAPI LLM Engine** server. (소모임 신규 개설 시, 모임 정보와 방장 프로필 데이터를 **FastAPI LLM Engine** 서버로 전달)
  - Executes async communication with FastAPI pipeline to score AI compatibility for candidate users. (FastAPI 파이프라인과의 비동기 통신을 통한 사용자 대상 AI 소모임 매칭률 스코어링)

---

### 3. 👤 `users` Module (사용자 및 프로필 관리 모듈)

Handles user account management, authentication/authorization, and profile configurations. (사용자 계정, 인증/인가 및 프로필 관리를 담당하는 모듈)

- **Authentication (인증 시스템)**: Implements JWT-based authentication and route guards. (JWT 기반 로그인 인증 및 Guards 구현)
- **Profile Modification (프로필 수정)**:
  - Fetches and updates user profiles including age, MBTI, interest keywords, and activity preferences. (사용자 프로필 정보(MBTI, 취향 키워드, 선호 요일/시간/지역 등) 조회 및 수정)
  - **Image Upload (이미지 업로드)**: Leverages `S3Client` to upload images directly to Cloudflare R2, generating public access URLs for database persistence. (`S3Client`를 활용하여 Cloudflare R2에 이미지 업로드 후, 외부 접근을 위한 URL 생성 및 DB 저장)
