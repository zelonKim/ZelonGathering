import { useState, useEffect } from "react";
import { ko, enUS } from "date-fns/locale";

const matchingTexts = {
  ko: {
    subtitle: "🤖 AI가 찾아낸 취향 저격 소모임",
    errorText: "매칭 데이터를 불러오지 못했습니다.",
    matchRateLabel: "매칭률",
    aiCommentPrefix: "AI의 한마디: ",
    passButton: "넘기기",
    joinButton: "참여하러 가기",
    emptyTitle: "아직 들어온 매칭 알림이 없습니다!",
    emptyDesc: "매칭 알림을 받고 싶다면, 소모임 취향 프로필을 작성해주세요 ✏️",
    dateLocale: ko,
  },
  en: {
    subtitle: "🤖 AI-curated gatherings matching your vibe",
    errorText: "Failed to load matching data.",
    matchRateLabel: "Match",
    aiCommentPrefix: "AI's Note: ",
    passButton: "Pass",
    joinButton: "Join Gathering",
    emptyTitle: "No matching notifications yet!",
    emptyDesc: "Please fill out your preference profile to get matches ✏️",
    dateLocale: enUS,
  },
};

export function useMatchingPageLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: matchingTexts[locale], locale };
}
