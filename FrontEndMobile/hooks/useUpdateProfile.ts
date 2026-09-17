import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/app/api/profile/updateProfile";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      alert("프로필이 성공적으로 저장되었습니다!");
    },
    onError: (error) => {
      console.error("프로필 수정 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    },
  });
};
