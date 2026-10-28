# 🤖 ZelonGathering - FastAPI AI Engine (FastAPI AI 분석 및 매칭 엔진)

> **Microservice dedicated to AI analysis and meetup matching for the ZelonGathering platform.**  
> Receives meetup details, host profiles, and candidate user data from the NestJS main server to generate **compatibility scores and personalized push notification texts** via OpenAI LLM pipeline (Structured Outputs).
>
> `ZelonGathering` 서비스의 **AI 분석 및 매칭 전용 마이크로서비스** 서버입니다.  
> NestJS 메인 서버로부터 전달받은 소모임 정보, 방장 프로필, 매칭 후보군 데이터를 기반으로 OpenAI LLM 파이프라인을 통해 **매칭 스코어링과 맞춤 푸시 알림 문구**를 생성합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: FastAPI (Python 3.13+)
- **AI Model & SDK**: OpenAI API (`gpt-4o-mini`), `openai` Client (Structured Outputs)
- **Data Validation**: Pydantic (`BaseModel`, `Field`)
- **Environment**: `python-dotenv`

---

## ⚙️ Core Components (핵심 구성요소)

1. **`main.py` - API Endpoints & Async LLM Pipeline (엔드포인트 및 AI 분석 로직)**
   - Provides FastAPI endpoints to receive batch matching requests from the NestJS backend. (NestJS 백엔드로부터 배치 매칭 요청을 수신하는 FastAPI 엔드포인트를 제공합니다.)
   - Executes asynchronous LLM pipelines using `gpt-4o-mini` to evaluate compatibility scores and compose tailored notification copy. (`gpt-4o-mini` 모델을 통해 비동기 LLM 파이프라인을 실행하여 매칭 스코어를 계산하고 맞춤형 알림 문구를 생성합니다.)

2. **`schemas.py` - Structured Outputs & DTO Schemas (데이터 모델 검증)**
   - Defines Pydantic input/output DTOs enforcing strict JSON schema for OpenAI Structured Outputs. (OpenAI Structured Outputs를 위한 엄격한 JSON 스키마를 Pydantic DTO로 정의합니다.)
   - Validates incoming payload data structures including user profiles, categories, and matching conditions. (유저 프로필, 카테고리, 매칭 조건 등 전달되는 페이로드 데이터의 구조적 무결성을 검증합니다.)

---

## 📂 Directory Structure (디렉터리 구조)

```text
BackEndFastAPI/
├── main.py          # FastAPI endpoints and async OpenAI analysis logic (FastAPI 엔드포인트 및 비동기 분석 로직)
├── schemas.py       # Pydantic input/output DTOs & Structured Outputs schemas (입출력 DTO 및 스키마)
├── requirements.txt # Python package dependencies list (파이썬 패키지 의존성 목록)
└── .env             # Environment variables e.g., OpenAI API Key (환경 변수 설정)
```
