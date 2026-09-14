import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { leaveGathering } from "@/app/api/gathering/leaveGathering";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export function useLeaveGathering(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => leaveGathering(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      queryClient.invalidateQueries({ queryKey: ["myChats"] });
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      alert(error.response?.data?.message || "소모임방에서 나가지 못했습니다.");
    },
    onSettled: () => {
      router.back();
    },
  });
}
