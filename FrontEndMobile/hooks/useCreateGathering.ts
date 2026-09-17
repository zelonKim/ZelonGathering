import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGathering } from "@/app/api/gathering/createGathering";
import { AxiosError } from "axios";
import { ApiErrorRes } from "@/types/ApiErrorRes";

interface UseCreateGatheringOptions {
  onSuccessCallback?: () => void;
}

export const useCreateGathering = (options?: UseCreateGatheringOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      alert("새로운 소모임이 성공적으로 개설되었습니다! 🎉");
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      options?.onSuccessCallback?.();
    },
    onError: (err: AxiosError<ApiErrorRes>) => {
      const serverMessage = err.response?.data?.message;
      const defaultMessage = "소모임 생성에 실패했습니다.";

      const errorMsg = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage || defaultMessage;

      alert(errorMsg);
    },
  });
};
