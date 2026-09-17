import { useMutation } from "@tanstack/react-query";
import { openPrivateChatRoom } from "@/app/api/chat/openPrivateChatRoom";
import { ApiErrorRes } from "@/types/ApiErrorRes";
import { AxiosError } from "axios";
import { router } from "expo-router";

export function useOpenPrivateChatRoom() {
  return useMutation({
    mutationFn: (partnerUserId: string) => openPrivateChatRoom(partnerUserId),
    onSuccess: (room) => {
      router.push(`/DM/${room.id}`);
    },
    onError: (error: AxiosError<ApiErrorRes>) => {
      const errorMessage =
        error.response?.data?.message ||
        "DM 방을 개설하는 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });
}
