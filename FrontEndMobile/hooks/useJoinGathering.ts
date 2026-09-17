import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { joinGathering } from "@/app/api/gathering/joinGathering";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export function useJoinGathering(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinGathering(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["myChats"] });
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      alert(
        error.response?.data?.message || "소모임방 참여 중 문제가 발생했습니다."
      );
    },
  });
}