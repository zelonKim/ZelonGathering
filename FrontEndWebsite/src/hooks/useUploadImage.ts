import { useMutation } from "@tanstack/react-query";
import { uploadProfileImage } from "@/api/profile/uploadProfileImage";

export const useUploadProfileImage = () => {
  return useMutation({
    mutationFn: uploadProfileImage,
    onError: (err) => {
      console.error("클라우드 이미지 업로드 실패:", err);
      alert("이미지를 업로드하지 못했습니다.");
    },
  });
};
