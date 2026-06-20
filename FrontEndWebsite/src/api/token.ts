// 🌟 파일 전체를 이 코드로 덮어쓰기 하세요!

const TOKEN_KEY = "ZELON_GATHERING_TOKEN";

// 1. 토큰 안전하게 저장 (웹 브라우저 LocalStorage 활용)
export const setAccessToken = async (token: string): Promise<void> => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// 2. 저장된 토큰 꺼내오기
export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// 3. 로그아웃 시 토큰 삭제 (혹시 나중에 쓰실 로그아웃 함수 가드)
export const removeAccessToken = async (): Promise<void> => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};
