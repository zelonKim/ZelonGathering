# 📱 ZelonGathering - Mobile App

> **Expo** 및 **React Native** 기반으로 구축되었으며, 소모임 생성 및 조회, 채팅, 지도 기반 장소 선택 등의 주요 기능을 제공합니다.

---

## 🛠️ Tech Stack
- **Framework**: Expo (React Native)
- **Routing**: Expo Router
- **Data Fetching / State**: @tanstack/react-query
- **HTTP Client**: Axios
- **Map / Location**: react-native-maps, expo-location
- **Icons**: @expo/vector-icons

---

### 📁 Project Architecture & Key Directories
- **`app/`**
    - Expo Router의 File-based 라우팅 방식을 사용하며, 탭 기반 레이아웃을 포함해 앱 전체의 큰 페이지 구조를 나누고 있음.

- **`api/`**
    - 백엔드 서버와의 통신을 위한 Axios 클라이언트 설정 및 서비스별 API 호출 함수들을 정의하고 있음.

- **`components/`**
    - 모달과 탭 페이지에 사용되는 다양한 UI 컴포넌트들을 정의하고 있음.

- **`constants/`**
    - 모임 카테고리 테마 색상, 요일/시간 매핑 데이터 등 프로젝트 전체에서 활용되는 고정 상수들을 정의하고 있음.

- **`hooks/`**
    - `@tanstack/react-query`의 `useQuery` 및 `useMutation`을 기반으로 API 함수를 호출하는 커스텀 훅들을 정의하고 있음.

- **`types/`**
    - API 데이터 모델, Props 등 프로젝트 전체에서 공유되는 타입들을 정의하고 있음.

- **`utils/`**
    - 카카오 REST API를 활용한 좌표-주소 변환 기능 등의 유틸 함수들을 정의하고 있음.

---

## 🚀 Getting Started

```bash
npx expo start
```
