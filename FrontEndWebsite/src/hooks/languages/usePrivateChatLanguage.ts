import { useState, useEffect } from "react";

const privateChatTexts = {
  ko: {
    loadingRoom: "채팅방을 불러오는 중...",
    roomNotFound: "채팅방을 찾을 수 없습니다.",
    mannerTemperature: "매너온도",
    loadingMessages: "대화 내역을 불러오는 중...",
    emptyMessages: "💬 아직 주고 받은 대화가 없습니다. \n첫 메시지를 보내보세요!",
    inputPlaceholder: "메시지를 입력하세요",
  },
  en: {
    loadingRoom: "Loading chat room...",
    roomNotFound: "Chat room not found.",
    mannerTemperature: "Manner Temp",
    loadingMessages: "Loading messages...",
    emptyMessages: "💬 No messages exchanged yet. \nSend your first message!",
    inputPlaceholder: "Type a message...",
  },
};

export function usePrivateChatLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: privateChatTexts[locale], locale };
}