import { useState, useEffect } from "react";

const chatsTexts = {
  ko: {
    subtitle: "👋 우리들의 실시간 대화",
    tabGathering: "💬 소모임 채팅",
    tabDm: "👤 DM",
    errorText: "채팅 목록을 가져오지 못했습니다.",
    emptyGathering: "현재 참여 중인 소모임 채팅방이 없습니다.",
    emptyDm: "진행 중인 1:1 대화가 없습니다.",
    defaultLastMessage: "아직 주고받은 대화가 없습니다. 첫 인사를 건네보세요!",
    defaultDmMessage: "대화를 시작해 보세요!",
  },
  en: {
    subtitle: "👋 Real-time Conversations",
    tabGathering: "💬 Gathering Chat",
    tabDm: "👤 DM",
    errorText: "Failed to fetch chat list.",
    emptyGathering: "You are currently not in any gathering chat rooms.",
    emptyDm: "No ongoing 1:1 chats.",
    defaultLastMessage: "No messages yet. Send your first greeting!",
    defaultDmMessage: "Start a conversation!",
  },
};

export function useChatsPageLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: chatsTexts[locale], locale };
}
