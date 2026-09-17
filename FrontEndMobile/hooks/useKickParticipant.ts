import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { kickParticipant } from "@/app/api/gathering/kickParticipant";
import { ApiErrorRes } from "@/types/ApiErrorRes";

export function useKickParticipant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => kickParticipant(id, targetUserId),
    onSuccess: () => {
      alert("해당 멤버를 강퇴 처리했습니다.");
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      alert(
        error.response?.data?.message || "강퇴 처리에 실패했습니다."
      );
    },
  });
}