import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { sendChatMessage } from "@/app/api/chat/sendChatMessage";
import { ApiErrorRes } from "@/types/ApiErrorRes";


export function useSendChatMessage(id?: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => sendChatMessage(id!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatheringChats", id] });
      queryClient.invalidateQueries({ queryKey: ["myChats"] });
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      alert(error.response?.data?.message || "메시지를 보내지 못했습니다.");
    },
  });
}
