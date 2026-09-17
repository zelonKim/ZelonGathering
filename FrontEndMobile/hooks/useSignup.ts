import { useMutation } from "@tanstack/react-query";
import { signup } from "@/app/api/auth/signup";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { AxiosError } from "axios";
import { router } from "expo-router";

export function useSignup() {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      alert(data.message || "회원가입이 완료되었습니다! 🎉");
      router.replace("/login");
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });
}
