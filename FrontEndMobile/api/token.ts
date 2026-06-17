import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "ZELON_GATHERING_TOKEN";


// 토큰 안전하게 저장
export const setAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// 저장된 토큰 꺼내오기
export const getAccessToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// 로그아웃 시 토큰 삭제
export const removeAccessToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
