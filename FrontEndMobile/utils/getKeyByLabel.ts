import { GATHERING_CATEGORY_COLOR } from "@/constants/gatheringCategoryColor";

export const GET_KEY_BY_LABEL = (label: string): string => {
  if (label === "전체") return "ALL";
  const match = Object.entries(GATHERING_CATEGORY_COLOR).find(
    ([_, v]) => v.label === label,
  );
  return match ? match[0] : "TALK";
};