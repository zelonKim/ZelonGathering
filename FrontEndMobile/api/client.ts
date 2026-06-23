import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getAccessToken } from "./token";

export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log("🔒 인증 만료 혹은 권한 없음");

      try {
        await SecureStore.deleteItemAsync("userToken");
        router.replace("/login");
      } catch (storeError) {
        console.log("토큰 삭제 중 에러 발생:", storeError);
      }
    }
    return Promise.reject(error);
  },
);
