import { useState, useEffect } from "react";

const createGatheringModalTexts = {
  ko: {
    modalTitle: "새로운 소모임 만들기 🍑",
    titleLabel: "모임 제목",
    titlePlaceholder: "예) 한강 러닝 모임",
    descriptionLabel: "모임 설명",
    descriptionPlaceholder: "모임의 상세 소개글을 작성해 주세요.",
    maxParticipantsLabel: "모임 정원 (명)",
    maxParticipantsPlaceholder: "최소 2명 ~ 최대 12명",
    submitButton: "소모임방 개설하기 🚀",
  },
  en: {
    modalTitle: "Create a New Gathering 🍑",
    titleLabel: "Title",
    titlePlaceholder: "e.g., Han River Running Group",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Please describe your gathering in detail.",
    maxParticipantsLabel: "Max Participants",
    maxParticipantsPlaceholder: "Min 2 ~ Max 12 people",
    submitButton: "Create Gathering Room 🚀",
  },
};

export function useCreateGatheringModalLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: createGatheringModalTexts[locale], locale };
}