const TOKEN_KEY = "ZELON_GATHERING_TOKEN";

// 토큰 저장 
export const setAccessToken = async (token: string): Promise<void> => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// 토큰 꺼내오기
export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// 토큰 삭제
export const removeAccessToken = async (): Promise<void> => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};
