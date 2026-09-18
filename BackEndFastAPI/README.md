# 🤖 ZelonGathering - FastAPI AI Engine

`ZelonGathering` 서비스의 **AI 분석 및 매칭 전용 microservice** 서버
NestJS 메인 서버로부터 전달받은 소모임 정보, 방장 프로필, 매칭 후보군 데이터를 기반으로 OpenAI LLM 파이프라인을 통해 **매칭 스코어링과 맞춤 푸시 알림 문구**를 생성함.

---

## 🛠 Tech Stack
* **Framework**: FastAPI (Python 3.13)
* **AI Model & SDK**: OpenAI API (`gpt-4o-mini`), `openai` Client (Structured Outputs)
* **Data Validation**: Pydantic (BaseModel, Field)
* **Environment**: `python-dotenv`

---

## 📂 Directory Structure
```text
BackEndFastAPI/
├── main.py          # FastAPI 엔드포인트 및 OpenAI 비동기 분석 로직
├── schemas.py       # Pydantic 기반 입출력 DTO 및 Structured Outputs 스키마
├── requirements.txt # Python 패키지 의존성 목록
└── .env             # 환경 변수 (OpenAI API Key 등)
```