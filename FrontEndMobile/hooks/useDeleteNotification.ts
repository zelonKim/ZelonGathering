import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "@/app/api/notification/deleteNotification";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
    },
    onError: (error) => {
      console.error("알림 삭제 실패:", error);
      alert("알림을 삭제하지 못했습니다. 다시 시도해주세요.");
    },
  });
};
