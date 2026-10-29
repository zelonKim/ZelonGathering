import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/app/api/profile/updateProfile";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const isKo =
    typeof window !== "undefined" &&
    navigator.language.toLowerCase().startsWith("ko");

  const messages = {
    ko: {
      success: "프로필이 성공적으로 저장되었습니다!",
      error: "프로필 저장 중 오류가 발생했습니다.",
    },
    en: {
      success: "Profile successfully saved!",
      error: "An error occurred while saving the profile.",
    },
  };

  const t = isKo ? messages.ko : messages.en;

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      alert(t.success);
    },
    onError: (error) => {
      console.error("프로필 수정 오류:", error);
      alert(t.error);
    },
  });
};
