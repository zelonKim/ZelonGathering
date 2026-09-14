import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { setAccessToken } from "@/app/api/token";
import { login } from "@/app/api/auth/login";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export function useLogin() {
  const router = useRouter();

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
