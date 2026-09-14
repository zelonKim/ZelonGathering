import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { deleteGathering } from "@/app/api/gathering/deleteGathering";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export function useDeleteGathering(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGathering(id),
    onSuccess: (data) => {
      if (data?.message) alert(data.message);
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      queryClient.invalidateQueries({ queryKey: ["myChats"] });
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      alert(
        error.response?.data?.message || "소모임방을 삭제하지 못했습니다."
      );
    },
  });
}