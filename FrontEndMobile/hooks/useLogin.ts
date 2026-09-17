import { useMutation } from "@tanstack/react-query";
import { login } from "@/app/api/auth/login";
import { setAccessToken } from "@/app/api/token";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { AxiosError } from "axios";
import { router } from "expo-router";

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      router.replace("/");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMessage =
        error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });
}
