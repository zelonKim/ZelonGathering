import { useState, useEffect } from "react";

const profileTexts = {
  ko: {
    subtitle: "✏️ 나의 소모임 취향 프로필",
    logoutButton: "로그아웃",
    logoutConfirm: "정말 로그아웃 하시겠습니까?",
    logoutError: "로그아웃 처리 중 오류가 발생했습니다.",
    errorTitle: "프로필을 불러오지 못했습니다. 다시 시도해 주세요.",
    loginMove: "로그인 화면으로 이동",
    fileSizeError: "파일 크기는 5MB 이하이어야 합니다.",
    alertNickname: "닉네임을 입력해주세요.",
    mannerTemp: "매너 온도",
    basicInfo: "기본 정보",
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "닉네임을 입력하세요",
    ageLabel: "나이",
    agePlaceholder: "나이를 입력하세요",
    mbtiLabel: "MBTI",
    mbtiPlaceholder: "MBTI를 입력하세요",

    tasteKeyword: "나의 취향 키워드",
    favoriteLabel: "내가 좋아하는 것",
    favoritePlaceholder: "자신이 좋아하는 것을 입력하세요.",
    hateLabel: "내가 싫어하는 것",
    hatePlaceholder: "자신이 싫어하는 것을 입력하세요.",

    preferGatheringAndRegion: "나의 선호 모임 및 지역",
    categoryLabel: "관심 카테고리",
    regionLabel: "활동 선호 지역",

    cityTabs: {
      SEOUL: "서울",
      GYEONGGI: "경기",
      OTHER: "기타 지역",
    },
    preferSchedule: "나의 선호 일정",
    dayLabel: "선호 요일",
    timeLabel: "선호 시간대",
    amPm: {
      AM: "오전 (AM)",
      PM: "오후 (PM)",
    },
    saveButton: "프로필 저장하기",
  },
  en: {
    subtitle: "✏️ My Gathering Preference Profile",
    logoutButton: "Log out",
    logoutConfirm: "Are you sure you want to log out?",
    logoutError: "An error occurred during logout.",
    errorTitle: "Failed to load profile. Please try again.",
    loginMove: "Go to Login",
    fileSizeError: "File size must be 5MB or less.",
    alertNickname: "Please enter your nickname.",
    mannerTemp: "Manner Temp",

    basicInfo: "Basic Information",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "Enter your nickname",
    ageLabel: "Age",
    agePlaceholder: "Enter your age",
    mbtiLabel: "MBTI",
    mbtiPlaceholder: "Enter your MBTI",

    tasteKeyword: "Preference Keywords",
    favoriteLabel: "Things I Like",
    favoritePlaceholder: "Enter things you like.",
    hateLabel: "Things I Dislike",
    hatePlaceholder: "Enter things you dislike.",

    preferGatheringAndRegion: "Preferred Gatherings & Regions",
    categoryLabel: "Interested Categories",
    regionLabel: "Preferred Activity Regions",

    cityTabs: {
      SEOUL: "Seoul",
      GYEONGGI: "Gyeonggi",
      OTHER: "Other Regions",
    },

    preferSchedule: "Preferred Schedule",
    dayLabel: "Preferred Days",
    timeLabel: "Preferred Times",
    amPm: {
      AM: "AM",
      PM: "PM",
    },
    saveButton: "Save Profile",
  },
};

export function useProfilePageLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: profileTexts[locale], locale };
}
