import { useState, useEffect } from "react";

const mainTexts = {
  ko: {
    title: "Gathering",
    subtitle: "📍 지금 내 주변 소모임",
    joinedTitle: "내가 참여 중인 소모임",
    noJoined: "참여 중인 모임이 없습니다.",
    noGathering: "주변에 열린 소모임방이 존재하지 않습니다",
    distanceStrFallback: "위치 확인 중",
    typeFilters: {
      전체: "전체",
      거리순: "거리순",
      "오늘 열리는": "오늘 열리는",
      "내일 열리는": "내일 열리는",
    },
    categoryFilters: {
      전체: "전체",
      스터디: "스터디",
      스포츠: "스포츠",
      아트: "아트",
      푸드: "푸드",
      독서: "독서",
      게임: "게임",
      토크: "토크",
      투어: "투어",
    },
  },
  en: {
    title: "Gathering",
    subtitle: "📍 Local gatherings around you",
    joinedTitle: "My Joined Gatherings",
    noJoined: "You haven't joined any gatherings yet.",
    noGathering: "No open gatherings found nearby.",
    distanceStrFallback: "Checking location",
    typeFilters: {
      전체: "All",
      거리순: "Distance",
      "오늘 열리는": "Today",
      "내일 열리는": "Tomorrow",
    },
    categoryFilters: {
      전체: "All",
      스터디: "Study",
      스포츠: "Sports",
      아트: "Art",
      푸드: "Food",
      독서: "Reading",
      게임: "Gaming",
      토크: "Talk",
      투어: "Tour",
    },
  },
};

export function useHomeLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: mainTexts[locale], locale };
}
